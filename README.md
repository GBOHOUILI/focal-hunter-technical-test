🇫🇷 Français | [🇬🇧 English](./README.en.md)
```markdown
# Focal Hunter — Test Technique React Native & Node.js

Application full-stack : liste de produits, détail produit, inscription à une liste d'attente avec notification asynchrone simulée (architecture orientée événements via BullMQ/Redis).

## Stack

- **Mobile** : Expo (SDK 54), React Native, TypeScript, React Navigation, TanStack Query
- **API** : Node.js, Express, TypeScript, Drizzle ORM, PostgreSQL
- **Worker** : Node.js, BullMQ, Redis
- **Monorepo** : pnpm workspaces (`apps/api`, `apps/worker`, `apps/mobile`, `packages/shared`)

## Architecture du repo

```
apps/
  api/        → API REST (produits, inscriptions)
  worker/     → Consumer BullMQ, traite les notifications de manière asynchrone
  mobile/     → Application Expo
packages/
  shared/     → Schéma Drizzle, types de domaine, schémas de validation zod partagés entre api et worker
```

Le schéma de base de données vit dans `packages/shared` (pas dans `apps/api`) pour que l'API et le worker puissent tous les deux le référencer sans dépendre l'un de l'autre — deux process séparés, une seule source de vérité pour la forme des données.

## Prérequis

- Node.js 20+
- pnpm 10+
- Docker (pour Postgres et Redis)
- Un téléphone avec Expo Go (SDK 54), ou un émulateur

## Setup

### 1. Cloner et installer

```bash
git clone https://github.com/GBOHOUILI/focal-hunter-technical-test.git
cd focal-hunter-technical-test
pnpm install
```

### 2. Lancer Postgres et Redis

```bash
docker compose up -d
docker compose ps   # les deux doivent passer à "healthy"
```

> Les ports exposés sont volontairement non-standards (Postgres sur `5433`, Redis sur `6380`) pour éviter les conflits avec d'éventuelles instances déjà installées localement sur la machine de développement. Adapter les `.env` en conséquence si besoin.

### 3. Variables d'environnement

Créer `apps/api/.env` :
```
NODE_ENV=development
PORT=3002
DATABASE_URL=postgres://zte:zte@localhost:5433/zte
REDIS_URL=redis://localhost:6380
SIGNUP_NOTIFICATION_DELAY_MS=3600000
```

Créer `apps/worker/.env` :
```
NODE_ENV=development
DATABASE_URL=postgres://zte:zte@localhost:5433/zte
REDIS_URL=redis://localhost:6380
```

Créer `apps/mobile/.env` (remplacer par l'IP locale de la machine hôte, pas `localhost` — indispensable pour un test sur téléphone physique) :
```
EXPO_PUBLIC_API_URL=http://<IP_LOCALE_DE_LA_MACHINE>:3002
```

### 4. Migrations + données de démo

```bash
cd apps/api
pnpm exec drizzle-kit migrate
pnpm db:seed
```

Le seed crée 2 magasins et 7 produits, dont un volontairement en rupture de stock (pour tester cet état visuel côté mobile).

### 5. Lancer les 3 process (3 terminaux séparés)

```bash
# Terminal 1
cd apps/api && pnpm dev

# Terminal 2
cd apps/worker && pnpm dev

# Terminal 3
cd apps/mobile && npx expo start
```

Scanner le QR code avec Expo Go (le téléphone et la machine doivent être sur le même réseau WiFi).

### 6. Tests

```bash
cd apps/api
pnpm test
```

## Schéma de base de données

Trois tables (`packages/shared/src/schema.ts`) :

- **`stores`** — magasins (`id`, `name`, `createdAt`)
- **`products`** — produits, liés à un magasin (`storeId` → FK `stores.id`, `ON DELETE CASCADE`)
  - `price` en `numeric(10,2)` avec `mode: "number"` (jamais de float pour de l'argent, mais converti en vrai `number` côté TypeScript pour rester ergonomique)
  - Contraintes `CHECK` : `stock >= 0`, `price > 0`
- **`signups`** — inscriptions à la liste d'attente d'un produit, liées à un produit (`productId` → FK `products.id`, `ON DELETE CASCADE`)
  - `status` : enum Postgres (`pending` / `sent` / `failed`), miroir exact du type TypeScript `SignupStatus` partagé
  - Contrainte unique composite `(productId, email)` — empêche un même email de s'inscrire deux fois sur le même produit, appliquée en base (pas seulement côté applicatif)

Migrations versionnées dans `apps/api/drizzle/`.

## API

| Méthode | Route | Description |
|---|---|---|
| GET | `/products` | Liste des produits (avec nom du magasin) |
| GET | `/products/:id` | Détail d'un produit |
| POST | `/products/:id/signup` | Inscription à la liste d'attente (`{ "email": string }`) |

Réponses d'erreur homogènes : `{ "error": { "code": string, "message": string, "details"?: unknown } }`.

## Architecture orientée événements

Le flux d'inscription :

1. `POST /products/:id/signup` valide l'email (zod), vérifie que le produit existe, enregistre l'inscription (`status: pending`)
2. **Aucun email n'est envoyé pendant la requête HTTP.** Un job est placé dans une queue BullMQ (Redis), avec un délai configuré (`SIGNUP_NOTIFICATION_DELAY_MS`, 1h par défaut)
3. Un **worker séparé** (process indépendant, `apps/worker`), écoute cette queue en continu. Une fois le délai écoulé, il traite le job : simule l'envoi de l'email (log), puis met à jour le statut en base (`sent` ou `failed`)

### Pourquoi une queue (BullMQ/Redis) plutôt qu'un cron ou un `setInterval`

Un cron devrait interroger périodiquement la base ("y a-t-il des inscriptions à traiter ?"), ce qui gaspille des ressources même quand il n'y a rien à faire, et introduit une latence égale à l'intervalle de polling. Avec BullMQ, Redis gère nativement le décompte du délai — le job devient "prêt" tout seul, sans qu'aucun process n'ait besoin de vérifier quoi que ce soit activement.

### Pourquoi l'API et le worker sont deux process séparés (deux dossiers `apps/*` distincts)

Si le worker plante (bug dans le traitement d'un job), l'API continue de répondre aux requêtes HTTP normalement — les deux ne partagent aucun état en mémoire. Ça permet aussi de les redéployer et de les scaler indépendamment (par exemple, plusieurs instances du worker pour absorber un pic de jobs, sans toucher à l'API).

### Résilience du traitement

Chaque job a `attempts: 3` avec un backoff exponentiel (délai croissant entre les tentatives). Le statut `failed` en base n'est appliqué qu'après épuisement des 3 tentatives — pas à chaque échec individuel — pour refléter fidèlement l'état réel du job.

## Autres choix notables

- **`packages/shared`** : le schéma Drizzle, les types de domaine et les schémas zod (validation email) sont centralisés ici. Évite la duplication et la désynchronisation entre l'API et le worker.
- **Contraintes en base (`UNIQUE`, `CHECK`)** en plus de la validation applicative : défense en profondeur — même un bug dans le code applicatif ne peut pas insérer une donnée incohérente.
- **TypeScript 7** (compilateur natif Go, sorti juillet 2026) : utilisé pour l'API et le worker. Nécessite `moduleResolution` en `bundler`/`nodenext` selon le contexte (l'ancien mode `node` a été retiré dans cette version).
- **Vulnérabilité esbuild (transitive, via `tsx`/`drizzle-kit`)** : corrigée via `pnpm.overrides` (`esbuild >= 0.25.0`) plutôt que de mettre à jour les outils parents, pour rester sur des versions stables compatibles avec le reste du projet.
- **Ports non-standards** (API `3002`, Postgres `5433`, Redis `6380`) : choisis pour éviter les conflits avec d'autres services déjà installés localement — voir `.env.example` de chaque app.

## Tests

7 tests unitaires (Vitest) sur `apps/api` :
- `products.service.spec.ts` — mapping DTO, gestion du produit inexistant
- `signups.service.spec.ts` — email invalide, produit inexistant, doublon, cas nominal (avec vérification que le job est bien planifié avec le bon payload)
```
