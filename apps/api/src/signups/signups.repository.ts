import { db } from "../common/database/client";
import { signups } from "@zte/shared";
import type { Database } from "../common/database/client";
import type { SignupStatus } from "@zte/shared";
import { ConflictException } from "../common/filters/http-exception.filter";
import { eq } from "drizzle-orm";



// Postgres error code for "unique_violation" — same code regardless of
// which unique constraint was hit, so we still need to check the constraint name.


const POSTGRES_UNIQUE_VIOLATION = "23505";

interface PgError {
  code?: string;
  constraint?: string;
}

export class SignupsRepository {
  constructor(private readonly database: Database = db) { }

  async create(productId: string, email: string) {
    try {
      const [signup] = await this.database
        .insert(signups)
        .values({ productId, email })
        .returning();

      return signup;
    } catch (err) {
      // Drizzle wraps the raw pg driver error inside `.cause` — the real
      // error code/constraint name live there, not on the top-level error.
      const pgError = (err as { cause?: PgError }).cause;

      if (
        pgError?.code === POSTGRES_UNIQUE_VIOLATION &&
        pgError?.constraint === "signups_product_id_email_unique"
      ) {
        throw new ConflictException("This email is already registered for this product");
      }

      throw err;
    }
  }

  // Called by the worker once a job is processed (successfully or not).
  async updateStatus(id: string, status: SignupStatus): Promise<void> {
    await this.database.update(signups).set({ status }).where(eq(signups.id, id));
  }
}
