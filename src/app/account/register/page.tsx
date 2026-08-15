"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/account/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "خطا در ثبت‌نام");
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
          <UserPlus className="h-8 w-8 text-mustard-400" />
          <h1 className="text-lg font-bold text-white">ساخت حساب کاربری</h1>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="نام و نام خانوادگی" value={name} onChange={(e) => setName(e.target.value)} required />
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
            ثبت‌نام
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-white/50">
          حساب دارید؟{" "}
          <Link href="/account/login" className="text-mustard-400 hover:text-mustard-300">
            وارد شوید
          </Link>
        </p>
      </div>
    </div>
  );
}
