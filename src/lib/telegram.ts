import type { PurchaseRequest, Product } from "@prisma/client";

const STATUS_LABEL_FA: Record<string, string> = {
  NEW: "🆕 جدید",
  IN_PROGRESS: "⏳ در حال بررسی",
  CONTACTED: "📞 تماس گرفته شد",
  COMPLETED: "✅ تکمیل شد",
  CANCELLED: "❌ لغو شد"
};

function formatPriceToman(price: number) {
  return price.toLocaleString("fa-IR") + " تومان";
}

function buildMessage(request: PurchaseRequest, product: Product) {
  const time = new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Tehran"
  }).format(request.createdAt);

  return [
    "🛒 *درخواست خرید جدید* — للهی",
    "",
    `👤 نام: ${request.customerName}`,
    `📱 شماره: ${request.customerPhone}`,
    `📦 محصول: ${product.name}`,
    `💰 قیمت: ${formatPriceToman(product.price)}`,
    `🕒 زمان: ${time}`,
    request.message ? `💬 پیام: ${request.message}` : null,
    "",
    `وضعیت: ${STATUS_LABEL_FA[request.status]}`
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Sends a purchase-request notification to every configured admin chat.
 * Never throws — Telegram failures must not affect the customer-facing flow.
 * Returns true if at least one message was delivered successfully.
 */
export async function notifyAdminsOfPurchaseRequest(
  request: PurchaseRequest,
  product: Product
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = (process.env.TELEGRAM_ADMIN_CHAT_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (!token || chatIds.length === 0) {
    console.warn("[telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_IDS missing — skipping notify");
    return false;
  }

  const text = buildMessage(request, product);
  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: "📞 تماس گرفته شد", callback_data: `pr:CONTACTED:${request.id}` },
        { text: "✅ پیگیری شد", callback_data: `pr:IN_PROGRESS:${request.id}` },
        { text: "❌ لغو شد", callback_data: `pr:CANCELLED:${request.id}` }
      ]
    ]
  };

  let anySuccess = false;

  await Promise.all(
    chatIds.map(async (chatId) => {
      try {
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: "Markdown",
            reply_markup: inlineKeyboard
          })
        });
        if (res.ok) anySuccess = true;
        else console.error("[telegram] sendMessage failed", chatId, await res.text());
      } catch (err) {
        console.error("[telegram] sendMessage error", chatId, err);
      }
    })
  );

  return anySuccess;
}
