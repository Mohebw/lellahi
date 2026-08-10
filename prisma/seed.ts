import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@departman.ir";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";

  const existingAdmin = await prisma.admin.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.admin.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, 12),
        name: "مدیر للهی",
        role: "ADMIN"
      }
    });
    console.log(`✅ Admin account created: ${adminEmail} / ${adminPassword} — CHANGE THIS PASSWORD AFTER FIRST LOGIN`);
  } else {
    console.log("ℹ️ Admin already exists, skipping.");
  }

  const categories = [
    { name: "اپل", slug: "apple", icon: "🍎", order: 1 },
    { name: "سامسونگ", slug: "samsung", icon: "📱", order: 2 },
    { name: "شیائومی", slug: "xiaomi", icon: "⚡", order: 3 },
    { name: "متفرقه", slug: "misc", icon: "🎧", order: 4 }
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, isActive: true }
    });
  }
  console.log("✅ Default categories ensured (اپل / سامسونگ / شیائومی / متفرقه)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
