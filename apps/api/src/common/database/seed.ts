import "dotenv/config";
import { db, pool } from "./client";
import { stores, products } from "./schema";

async function main() {
  console.log("Seeding...");

  // Wipes existing data first so the seed can be re-run without duplicating rows.
  await db.execute(`TRUNCATE TABLE signups, products, stores RESTART IDENTITY CASCADE`);

  const [storeA, storeB] = await db
    .insert(stores)
    .values([{ name: "Le Panier Cotonois" }, { name: "AURECO Market" }])
    .returning();

  await db.insert(products).values([
    {
      title: "Ananas Pain de Sucre",
      description: "Ananas cultivé localement, récolté à maturité.",
      price: 150,
      currency: "XOF",
      stock: 42,
      imageUrl: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba",
      storeId: storeA.id,
    },
    {
      title: "Sac de Riz Local 25kg",
      description: "Riz étuvé produit dans la vallée de l'Ouémé.",
      price: 18500,
      currency: "XOF",
      stock: 15,
      imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c",
      storeId: storeA.id,
    },
    {
      title: "Panier de Légumes Bio",
      description: "Assortiment hebdomadaire de légumes bio.",
      price: 2500,
      currency: "XOF",
      stock: 8,
      imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999",
      storeId: storeB.id,
    },
    {
      title: "Miel Artisanal 500ml",
      description: "Miel pur récolté par des apiculteurs locaux.",
      price: 1200,
      currency: "XOF",
      stock: 25,
      imageUrl: "https://images.unsplash.com/photo-1671548185843-3f50c6c1060b?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      storeId: storeB.id,
    },
    {
      title: "Café Moulu Robusta 1kg",
      description: "Café torréfié artisanalement, mouture moyenne.",
      price: 5800,
      currency: "XOF",
      stock: 30,
      imageUrl: "https://images.unsplash.com/photo-1447933601403-0c6688de566e",
      storeId: storeA.id,
    },
    {
      title: "Poulet Fermier Entier",
      description: "Poulet élevé en plein air, prêt à cuire.",
      price: 6500,
      currency: "XOF",
      stock: 12,
      imageUrl: "https://images.unsplash.com/photo-1587593810167-a84920ea0781",
      storeId: storeB.id,
    },
  ]);

  console.log("Seed done.");
  await pool.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
