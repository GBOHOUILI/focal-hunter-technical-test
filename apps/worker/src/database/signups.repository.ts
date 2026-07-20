import { eq } from "drizzle-orm";
import { db } from "./client";
import { signups } from "@zte/shared";
import type { SignupStatus } from "@zte/shared";

export class SignupsRepository {
  async updateStatus(id: string, status: SignupStatus): Promise<void> {
    await db.update(signups).set({ status }).where(eq(signups.id, id));
  }
}
