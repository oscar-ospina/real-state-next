import "dotenv/config";
import { db } from "./index";
import { users } from "./schema";
import { hash } from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  // Hash passwords
  const adminPassword = await hash("admin123", 10);
  const userPassword = await hash("user123", 10);

  // Create admin user
  const [admin] = await db
    .insert(users)
    .values({
      email: "admin@realstate.com",
      name: "Administrador",
      passwordHash: adminPassword,
      roles: ["admin", "landlord"],
    })
    .onConflictDoNothing()
    .returning();

  if (admin) {
    console.log("Admin user created:", admin.email);
  } else {
    console.log("Admin user already exists");
  }

  // Create regular user (tenant)
  const [user] = await db
    .insert(users)
    .values({
      email: "usuario@realstate.com",
      name: "Usuario Demo",
      passwordHash: userPassword,
      roles: ["tenant"],
    })
    .onConflictDoNothing()
    .returning();

  if (user) {
    console.log("Regular user created:", user.email);
  } else {
    console.log("Regular user already exists");
  }

  console.log("Seeding completed!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
