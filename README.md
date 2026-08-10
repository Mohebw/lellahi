# للهی | Lellahi Tel

فروشگاه اینترنتی موبایل و لوازم دیجیتال — آمل، خیابان هراز.
دامنه: **departman.ir** (ثبت‌شده در Cloudflare)

## معماری فنی

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion
- **Backend:** Next.js API Routes / Route Handlers
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** Session-based (JWT در Cookie امن HttpOnly) با bcrypt برای هش پسورد
- **Notifications:** Telegram Bot API (چند ادمین، مقاوم به خطا)
- **Image storage:** فایل‌سیستم محلی روی VPS (`public/uploads`) — قابل مهاجرت به S3/Object Storage در آینده

## ساختار پوشه‌ها

```
src/
  app/
    (public pages)         → /, /products, /products/[slug], /about, /contact
    admin/                 → پنل مدیریت (محافظت‌شده با middleware)
    api/
      purchase-requests/   → ثبت درخواست خرید (عمومی)
      admin/                → APIهای محافظت‌شده (محصولات، دسته‌بندی، درخواست‌ها، آپلود، ورود/خروج)
  components/
    ui/                     → Design System (Button, Input, Modal, Card, Toast, ...)
    layout/                 → Navbar, Footer, HeroVisual
    products/               → ProductCard, Filters, PurchaseModal, Gallery
    admin/                  → AdminShell, ProductForm, StatsCard
  lib/                      → prisma, auth, telegram, utils, validations (zod)
  middleware.ts             → محافظت از /admin و /api/admin
prisma/
  schema.prisma             → مدل‌های Admin, Category, Product, ProductImage, PurchaseRequest
  seed.ts                   → ساخت اکانت ادمین اولیه + دسته‌بندی‌های پیش‌فرض
```

## توسعه محلی

```bash
npm install
cp .env.example .env   # مقادیر واقعی را پر کنید (حداقل DATABASE_URL و AUTH_SECRET)
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

پس از seed، با ایمیل/پسوردی که در `.env` گذاشتید (پیش‌فرض: `admin@departman.ir` / `ChangeMe123!`) وارد `/admin/login` شوید — **بلافاصله پسورد را عوض کنید.**

---

## راهنمای کامل Deployment روی VPS

### ۱. اتصال به VPS

```bash
ssh root@YOUR_SERVER_IP
```

### ۲. نصب پیش‌نیازها

```bash
apt update && apt upgrade -y
apt install -y curl git build-essential nginx postgresql postgresql-contrib
```

### ۳. نصب Node.js (نسخه ۲۰ LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v && npm -v
npm install -g pm2
```

### ۴. ساخت دیتابیس PostgreSQL

```bash
sudo -u postgres psql
```

داخل psql:

```sql
CREATE USER lellahi_user WITH PASSWORD 'یک-پسورد-قوی-اینجا';
CREATE DATABASE lellahi_tel OWNER lellahi_user;
GRANT ALL PRIVILEGES ON DATABASE lellahi_tel TO lellahi_user;
\q
```

### ۵. دریافت پروژه روی سرور

```bash
mkdir -p /var/www/lellahi-tel
cd /var/www/lellahi-tel
git clone <آدرس-ریپازیتوری-شما> .
```

### ۶. تنظیم Environment Variables

```bash
cp .env.example .env
nano .env
```

مقادیر زیر را حتماً پر کنید:
- `DATABASE_URL` → با پسورد واقعی PostgreSQL که در مرحله ۴ ساختید
- `AUTH_SECRET` → با `openssl rand -base64 32` یک مقدار تصادفی بسازید
- `NEXT_PUBLIC_SITE_URL="https://departman.ir"`
- `TELEGRAM_BOT_TOKEN` و `TELEGRAM_ADMIN_CHAT_IDS`
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (پسورد اولیه پنل ادمین)

### ۷. نصب Dependencies

```bash
npm install
```

### ۸. اجرای Prisma Migration + Seed

```bash
npx prisma migrate deploy
npm run db:seed
```

### ۹. Build پروژه

```bash
npm run build
```

### ۱۰. اجرا با PM2 (اجرای دائمی)

```bash
pm2 start npm --name "lellahi-tel" -- start
pm2 save
pm2 startup   # دستوری که نمایش می‌دهد را اجرا کنید تا PM2 با ریبوت سرور بالا بیاید
```

بررسی وضعیت: `pm2 status` و لاگ‌ها: `pm2 logs lellahi-tel`

### ۱۱. تنظیم Nginx به‌عنوان Reverse Proxy

```bash
nano /etc/nginx/sites-available/departman.ir
```

```nginx
server {
    listen 80;
    server_name departman.ir www.departman.ir;

    client_max_body_size 10M; # برای آپلود تصاویر محصولات

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/departman.ir /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### ۱۲. اتصال دامنه (Cloudflare)

در Cloudflare DNS برای `departman.ir`:
- یک رکورد `A` به `@` با IP سرور خودتان بسازید
- یک رکورد `A` یا `CNAME` برای `www` هم به همان IP/دامنه بسازید
- **نکته مهم:** موقع نصب SSL روی سرور (مرحله بعد)، Proxy Status کلادفلر (ابر نارنجی) را موقتاً روی **DNS only** (خاکستری) بگذارید تا Let's Encrypt بتواند دامنه را وریفای کند؛ بعد از گرفتن گواهی می‌توانید دوباره Proxy را فعال کنید.

### ۱۳. فعال کردن SSL با Let's Encrypt

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d departman.ir -d www.departman.ir
```

### ۱۴. Auto-Renew گواهی SSL

Certbot به‌صورت خودکار یک systemd timer نصب می‌کند. تست کنید:

```bash
certbot renew --dry-run
```

### ۱۵. باز کردن پورت‌های Firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

---

## به‌روزرسانی سایت بعد از تغییرات (Git Pull + Build)

```bash
cd /var/www/lellahi-tel
git pull origin main
npm install
npx prisma migrate deploy
npm run build
pm2 restart lellahi-tel
```

---

## تنظیم بات تلگرام

1. با [@BotFather](https://t.me/BotFather) یک بات جدید بسازید و توکن را بگیرید → `TELEGRAM_BOT_TOKEN`
2. با هر اکانت تلگرام ادمین، به بات پیام `/start` بدهید
3. Chat ID هر ادمین را با ابزاری مثل [@userinfobot](https://t.me/userinfobot) پیدا کنید
4. همه Chat IDها را با کاما در `TELEGRAM_ADMIN_CHAT_IDS` بگذارید

هر درخواست خرید جدید، پیامی با دکمه‌های «تماس گرفته شد» / «پیگیری شد» / «لغو شد» برای همه‌ی ادمین‌ها ارسال می‌شود. **حتی اگر ارسال تلگرام با خطا مواجه شود، درخواست مشتری در دیتابیس ذخیره شده و از دست نمی‌رود.**

---

## قابلیت‌های آماده برای توسعه آینده (بدون نیاز به بازنویسی)

معماری پروژه (مدل‌های Prisma مجزا، جداسازی Business Logic از UI، کامپوننت‌های Reusable) از قبل برای موارد زیر آماده شده:

- درگاه پرداخت آنلاین (متغیرهای env در `.env.example` پیش‌بینی شده)
- سبد خرید و سیستم سفارش کامل
- حساب کاربری مشتری، Wishlist، مقایسه محصولات
- کد تخفیف و سیستم تخفیف پیشرفته‌تر
- اتصال SMS / WhatsApp برای اطلاع‌رسانی
- سیستم تیکت پشتیبانی
- نقش‌های چندگانه ادمین (مدل `AdminRole` از قبل `ADMIN` و `MANAGER` دارد)
- Blog و سیستم نظرات
- PWA
