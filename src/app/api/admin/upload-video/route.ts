import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_VIDEO_SIZE = 40 * 1024 * 1024; // 40MB — keep modest given limited disk on VPS

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "فایلی ارسال نشده" }, { status: 400 });
    }
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "فقط ویدیوهای MP4، WebM یا MOV مجاز است" }, { status: 400 });
    }
    if (file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json({ error: "حجم ویدیو نباید بیشتر از ۴۰ مگابایت باشد" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "videos");
    await mkdir(uploadDir, { recursive: true });

    const ext = file.type === "video/webm" ? "webm" : file.type === "video/quicktime" ? "mov" : "mp4";
    const filename = `${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/videos/${filename}` }, { status: 201 });
  } catch (err) {
    console.error("[upload-video] failed:", err);
    const message =
      err instanceof Error && err.message.includes("ENOSPC")
        ? "فضای دیسک سرور پر است — لطفاً با پشتیبانی تماس بگیرید"
        : "خطا در ذخیره‌سازی ویدیو روی سرور";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
