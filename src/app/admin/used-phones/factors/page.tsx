"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, Badge } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";

type FactorOption = {
  id: string;
  groupKey: string;
  groupLabel: string;
  optionKey: string;
  optionLabel: string;
  category: "HARDWARE" | "SOFTWARE" | "ACCESSORY";
  percent: number;
  isDefault: boolean;
};

type BatterySetting = {
  thresholdPercent: number;
  percentPerPointBelow: number;
};

const CATEGORY_LABEL: Record<string, string> = {
  HARDWARE: "سخت‌افزاری",
  SOFTWARE: "نرم‌افزاری",
  ACCESSORY: "لوازم جانبی"
};

export default function AdminUsedPhoneFactorsPage() {
  const [options, setOptions] = useState<FactorOption[]>([]);
  const [battery, setBattery] = useState<BatterySetting>({ thresholdPercent: 80, percentPerPointBelow: 0.5 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { show } = useToast();

  async function load() {
    setLoading(true);
    const [optsRes, batteryRes] = await Promise.all([
      fetch("/api/admin/used-phone-factors"),
      fetch("/api/admin/used-phone-battery-setting")
    ]);
    setOptions(await optsRes.json());
    setBattery(await batteryRes.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function updatePercent(id: string, value: number) {
    setOptions((opts) => opts.map((o) => (o.id === id ? { ...o, percent: value } : o)));
  }

  async function handleSaveAll() {
    setSaving(true);
    try {
      const [factorsRes, batteryRes] = await Promise.all([
        fetch("/api/admin/used-phone-factors", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates: options.map((o) => ({ id: o.id, percent: o.percent })) })
        }),
        fetch("/api/admin/used-phone-battery-setting", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(battery)
        })
      ]);
      if (!factorsRes.ok || !batteryRes.ok) {
        show("خطا در ذخیره‌سازی", "error");
        return;
      }
      show("همه‌ی تنظیمات ذخیره شد", "success");
    } finally {
      setSaving(false);
    }
  }

  const grouped = options.reduce<Record<string, FactorOption[]>>((acc, o) => {
    acc[o.groupKey] = acc[o.groupKey] || [];
    acc[o.groupKey].push(o);
    return acc;
  }, {});

  return (
    <AdminShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">تنظیم درصدهای قیمت‌گذاری</h1>
        <Button onClick={handleSaveAll} loading={saving}>
          <Save className="h-4 w-4" />
          ذخیره همه تغییرات
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-white/40">در حال بارگذاری...</p>
      ) : (
        <div className="flex flex-col gap-4">
          <Card>
            <h2 className="mb-4 text-sm font-semibold text-white">فرمول سلامت باتری (به‌صورت نواری از مشتری گرفته می‌شود)</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="آستانه (٪) — پایین‌تر از این عدد کسر اعمال می‌شود"
                type="number"
                value={battery.thresholdPercent}
                onChange={(e) => setBattery((b) => ({ ...b, thresholdPercent: Number(e.target.value) }))}
              />
              <Input
                label="درصد کسر به‌ازای هر ۱٪ افت زیر آستانه"
                type="number"
                step="0.1"
                value={battery.percentPerPointBelow}
                onChange={(e) => setBattery((b) => ({ ...b, percentPerPointBelow: Number(e.target.value) }))}
              />
            </div>
            <p className="mt-2 text-xs text-white/40">
              مثال: با تنظیمات پیش‌فرض، باتری ۷۰٪ یعنی (۸۰-۷۰)×۰.۵ = ۵٪ کسر از قیمت.
            </p>
          </Card>

          {Object.entries(grouped).map(([groupKey, opts]) => (
            <Card key={groupKey}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">{opts[0].groupLabel}</h2>
                <Badge tone="gray">{CATEGORY_LABEL[opts[0].category]}</Badge>
              </div>
              <div className="flex flex-col gap-2">
                {opts.map((o) => (
                  <div key={o.id} className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-3 py-2">
                    <span className="text-sm text-white/80">
                      {o.optionLabel}
                      {o.isDefault && <span className="mr-2 text-xs text-white/30">(پیش‌فرض)</span>}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.5"
                        value={o.percent}
                        onChange={(e) => updatePercent(o.id, Number(e.target.value))}
                        className="w-20 rounded-lg border border-line bg-white/5 px-2 py-1 text-left text-sm text-white focus:border-mustard-400/50 focus:outline-none"
                        dir="ltr"
                      />
                      <span className="text-xs text-white/40">٪</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
