"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/account/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "خطا در ورود");
        return;
      }
      router.push("/account");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-lellahi flex min-h-[70vh] items-center justify-center py-16">
      <div className="glass-panel w-full max-w-sm p-8">
        <div className="mb-6 flex flex-col items-center gap-2">
          <LogIn className="h-8 w-8 text-mustard-400" />
          <h1 className="text-lg font-bold text-white">ورود به حساب کاربری</h1>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="شماره تماس"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="09121234567"
            dir="ltr"
            className="text-right"
            inputMode="numeric"
            required
          />
          <Input
            label="رمز عبور"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">
            ورود
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-white/50">
          حساب ندارید؟{" "}
          <Link href="/account/register" className="text-mustard-400 hover:text-mustard-300">
            ثبت‌نام کنید
          </Link>
        </p>
      </div>
    </div>
  );
}
