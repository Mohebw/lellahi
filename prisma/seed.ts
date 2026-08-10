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

  await prisma.usedPhoneBatterySetting.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", thresholdPercent: 80, percentPerPointBelow: 0.5 }
  });

  type FactorSeed = {
    groupKey: string;
    groupLabel: string;
    category: "HARDWARE" | "SOFTWARE" | "ACCESSORY";
    options: { optionKey: string; optionLabel: string; percent: number; isDefault?: boolean }[];
  };

  const factorGroups: FactorSeed[] = [
    {
      groupKey: "body_opened",
      groupLabel: "بازشدگی بدنه / مهر شکسته",
      category: "HARDWARE",
      options: [
        { optionKey: "no", optionLabel: "باز نشده", percent: 0, isDefault: true },
        { optionKey: "yes", optionLabel: "باز شده", percent: -15 }
      ]
    },
    {
      groupKey: "battery_part",
      groupLabel: "وضعیت باتری (پارت نامبر)",
      category: "HARDWARE",
      options: [
        { optionKey: "original", optionLabel: "اصلی / تعویض‌نشده", percent: 0, isDefault: true },
        { optionKey: "replaced_valid", optionLabel: "تعویضی - پارت نامبر اصلی", percent: -3 },
        { optionKey: "replaced_invalid", optionLabel: "تعویضی - پارت نامبر نامعتبر", percent: -5 }
      ]
    },
    {
      groupKey: "screen_condition",
      groupLabel: "وضعیت صفحه نمایش",
      category: "HARDWARE",
      options: [
        { optionKey: "perfect", optionLabel: "سالم", percent: 0, isDefault: true },
        { optionKey: "replaced_valid", optionLabel: "تعویضی - پارت نامبر اصلی", percent: -5 },
        { optionKey: "replaced_invalid", optionLabel: "تعویضی - پارت نامبر نامعتبر", percent: -12 },
        { optionKey: "scratched", optionLabel: "خط و خش دار", percent: -8 },
        { optionKey: "cracked", optionLabel: "ترک خورده / شکسته", percent: -20 }
      ]
    },
    {
      groupKey: "camera_condition",
      groupLabel: "وضعیت دوربین",
      category: "HARDWARE",
      options: [
        { optionKey: "perfect", optionLabel: "سالم", percent: 0, isDefault: true },
        { optionKey: "replaced_valid", optionLabel: "تعویضی - پارت نامبر اصلی", percent: -8 },
        { optionKey: "replaced_invalid", optionLabel: "تعویضی - پارت نامبر نامعتبر", percent: -15 },
        { optionKey: "issue", optionLabel: "مشکل‌دار (لرزش، فوکوس و ...)", percent: -15 }
      ]
    },
    {
      groupKey: "face_id",
      groupLabel: "Face ID / Touch ID",
      category: "HARDWARE",
      options: [
        { optionKey: "working", optionLabel: "سالم و فعال", percent: 0, isDefault: true },
        { optionKey: "not_working", optionLabel: "غیرفعال / خراب", percent: -10 }
      ]
    },
    {
      groupKey: "body_condition",
      groupLabel: "وضعیت ظاهری بدنه",
      category: "HARDWARE",
      options: [
        { optionKey: "perfect", optionLabel: "سالم / بدون خط و خش", percent: 0, isDefault: true },
        { optionKey: "scratched", optionLabel: "خط و خش جزئی", percent: -5 },
        { optionKey: "dented", optionLabel: "ضربه‌خورده / تاب‌برداشته", percent: -10 },
        { optionKey: "replaced", optionLabel: "بدنه تعویضی", percent: -15 }
      ]
    },
    {
      groupKey: "liquid_damage",
      groupLabel: "آب‌خوردگی (Liquid Damage)",
      category: "HARDWARE",
      options: [
        { optionKey: "no", optionLabel: "بدون آب‌خوردگی", percent: 0, isDefault: true },
        { optionKey: "yes", optionLabel: "دارای اثر آب‌خوردگی", percent: -20 }
      ]
    },
    {
      groupKey: "speaker_mic",
      groupLabel: "اسپیکر / میکروفون",
      category: "HARDWARE",
      options: [
        { optionKey: "working", optionLabel: "سالم", percent: 0, isDefault: true },
        { optionKey: "issue", optionLabel: "مشکل‌دار", percent: -8 }
      ]
    },
    {
      groupKey: "charging_port",
      groupLabel: "پورت شارژ",
      category: "HARDWARE",
      options: [
        { optionKey: "working", optionLabel: "سالم", percent: 0, isDefault: true },
        { optionKey: "issue", optionLabel: "مشکل‌دار", percent: -6 }
      ]
    },
    {
      groupKey: "buttons",
      groupLabel: "دکمه‌ها (پاور / صدا / سکوت)",
      category: "HARDWARE",
      options: [
        { optionKey: "working", optionLabel: "سالم", percent: 0, isDefault: true },
        { optionKey: "issue", optionLabel: "مشکل‌دار", percent: -4 }
      ]
    },
    {
      groupKey: "icloud_account",
      groupLabel: "وضعیت آیکلاود / اکانت",
      category: "SOFTWARE",
      options: [
        { optionKey: "clean", optionLabel: "خارج شده / پاک", percent: 0, isDefault: true },
        { optionKey: "locked", optionLabel: "قفل است (Locked)", percent: -99 }
      ]
    },
    {
      groupKey: "registration",
      groupLabel: "وضعیت رجیستری",
      category: "SOFTWARE",
      options: [
        { optionKey: "registered", optionLabel: "رجیستر شده", percent: 0, isDefault: true },
        { optionKey: "not_registered", optionLabel: "رجیستر نشده", percent: -25 }
      ]
    },
    {
      groupKey: "software_health",
      groupLabel: "وضعیت نرم‌افزاری کلی",
      category: "SOFTWARE",
      options: [
        { optionKey: "clean", optionLabel: "سالم و بدون مشکل", percent: 0, isDefault: true },
        { optionKey: "issue", optionLabel: "مشکل‌دار / نیاز به بررسی", percent: -5 }
      ]
    },
    {
      groupKey: "accessory_box",
      groupLabel: "جعبه اصلی",
      category: "ACCESSORY",
      options: [
        { optionKey: "yes", optionLabel: "دارد", percent: 0, isDefault: true },
        { optionKey: "no", optionLabel: "ندارد", percent: -2 }
      ]
    },
    {
      groupKey: "accessory_cable",
      groupLabel: "کابل",
      category: "ACCESSORY",
      options: [
        { optionKey: "yes", optionLabel: "دارد", percent: 0, isDefault: true },
        { optionKey: "no", optionLabel: "ندارد", percent: -2 }
      ]
    },
    {
      groupKey: "accessory_adapter",
      groupLabel: "آداپتور",
      category: "ACCESSORY",
      options: [
        { optionKey: "yes", optionLabel: "دارد", percent: 0, isDefault: true },
        { optionKey: "no", optionLabel: "ندارد", percent: -2 }
      ]
    },
    {
      groupKey: "accessory_headphone",
      groupLabel: "هندزفری",
      category: "ACCESSORY",
      options: [
        { optionKey: "yes", optionLabel: "دارد", percent: 0, isDefault: true },
        { optionKey: "no", optionLabel: "ندارد", percent: -2 }
      ]
    }
  ];

  let groupOrder = 0;
  for (const group of factorGroups) {
    groupOrder += 1;
    let optionOrder = 0;
    for (const opt of group.options) {
      optionOrder += 1;
      await prisma.usedPhoneFactorOption.upsert({
        where: { groupKey_optionKey: { groupKey: group.groupKey, optionKey: opt.optionKey } },
        update: {},
        create: {
          groupKey: group.groupKey,
          optionKey: opt.optionKey,
          groupLabel: group.groupLabel,
          optionLabel: opt.optionLabel,
          category: group.category,
          percent: opt.percent,
          isDefault: opt.isDefault || false,
          order: groupOrder * 10 + optionOrder
        }
      });
    }
  }
  console.log("✅ Used-phone price factors seeded (17 groups)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
