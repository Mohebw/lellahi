"use client";

import { useEffect, useMemo, useState } from "react";
import { Calculator, Battery, Smartphone } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { formatToman } from "@/lib/utils";

type UsedModel = { id: string; brand: string; name: string };

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

type EstimateResult = {
  modelName: string;
  basePrice: number;
  totalDeductionPercent: number;
  estimatedPrice: number;
  breakdown: { label: string; percent: number }[];
};

const CATEGORY_LABEL: Record<string, string> = {
  HARDWARE: "وضعیت سخت‌افزاری",
  SOFTWARE: "وضعیت نرم‌افزاری",
  ACCESSORY: "لوازم جانبی همراه"
};

export default function UsedPhonesPage() {
  const [models, setModels] = useState<UsedModel[]>([]);
  const [options, setOptions] = useState<FactorOption[]>([]);
  const [modelId, setModelId] = useState("");
  const [batteryHealth, setBatteryHealth] = useState(90);
  const [selected, setSelected] = useState<Record<string, string>>({}); // groupKey -> optionId
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<EstimateResult | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/used-phone-models").then((r) => r.json()),
      fetch("/api/used-phone-factors").then((r) => r.json())
    ]).then(([modelsData, optionsData]: [UsedModel[], FactorOption[]]) => {
      setModels(modelsData);
      setOptions(optionsData);
      const defaults: Record<string, string> = {};
      optionsData.forEach((o) => {
        if (o.isDefault) defaults[o.groupKey] = o.id;
      });
      setSelected(defaults);
      setLoading(false);
    });
  }, []);

  const grouped = useMemo(() => {
    return options.reduce<Record<string, FactorOption[]>>((acc, o) => {
      acc[o.groupKey] = acc[o.groupKey] || [];
      acc[o.groupKey].push(o);
      return acc;
    }, {});
  }, [options]);

  const groupedByCategory = useMemo(() => {
    const cats: Record<string, string[]> = { HARDWARE: [], SOFTWARE: [], ACCESSORY: [] };
    Object.entries(grouped).forEach(([groupKey, opts]) => {
      cats[opts[0].category].push(groupKey);
    });
    return cats;
  }, [grouped]);

  async function handleCalculate() {
    if (!modelId) return;
    setCalculating(true);
    setResult(null);
    try {
      const res = await fetch("/api/used-phone-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId,
          batteryHealth,
          optionIds: Object.values(selected)
        })
      });
      if (res.ok) setResult(await res.json());
    } finally {
      setCalculating(false);
    }
  }

  return (
    <div className="container-lellahi py-10">
      <div className="mb-8 text-center">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-mustard-400/30 bg-mustard-400/10 px-3 py-1 text-xs text-mustard-300">
          <Calculator className="h-3.5 w-3.5" />
          محاسبه‌گر قیمت
        </span>
        <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">قیمت گوشی دست‌دوم خود را بدانید</h1>
        <p className="text-sm text-white/50">مدل و وضعیت گوشی‌تان را مشخص کنید تا قیمت تخمینی فروش را ببینید.</p>
      </div>

      {loading ? (
        <p className="text-center text-sm text-white/40">در حال بارگذاری...</p>
      ) : (
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="glass-panel p-5">
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
              <Smartphone className="h-4 w-4 text-mustard-400" />
              انتخاب مدل گوشی
            </label>
            <Select value={modelId} onChange={(e) => setModelId(e.target.value)}>
              <option value="">مدل گوشی خود را انتخاب کنید</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.brand} {m.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="glass-panel p-5">
            <label className="mb-3 flex items-center justify-between text-sm font-semibold text-white">
              <span className="flex items-center gap-2">
                <Battery className="h-4 w-4 text-mustard-400" />
                سلامت باتری
              </span>
              <span className="font-mono text-mustard-400">{batteryHealth}٪</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={batteryHealth}
              onChange={(e) => setBatteryHealth(Number(e.target.value))}
              className="w-full accent-mustard-400"
            />
            <p className="mt-2 text-xs text-white/40">این عدد را از تنظیمات گوشی، بخش سلامت باتری، ببینید.</p>
          </div>

          {(["HARDWARE", "SOFTWARE", "ACCESSORY"] as const).map((cat) =>
            groupedByCategory[cat].length > 0 ? (
              <div key={cat} className="glass-panel p-5">
                <h2 className="mb-4 text-sm font-semibold text-white">{CATEGORY_LABEL[cat]}</h2>
                <div className="flex flex-col gap-4">
                  {groupedByCategory[cat].map((groupKey) => (
                    <div key={groupKey}>
                      <p className="mb-1.5 text-xs text-white/50">{grouped[groupKey][0].groupLabel}</p>
                      <Select
                        value={selected[groupKey] || ""}
                        onChange={(e) => setSelected((s) => ({ ...s, [groupKey]: e.target.value }))}
                      >
                        {grouped[groupKey].map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.optionLabel}
                          </option>
                        ))}
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          )}

          <Button size="lg" className="w-full" disabled={!modelId} loading={calculating} onClick={handleCalculate}>
            محاسبه قیمت تخمینی
          </Button>

          {result && (
            <div className="glass-panel p-6 text-center">
              <p className="mb-1 text-sm text-white/50">{result.modelName}</p>
              <p className="mb-3 font-mono text-3xl font-bold text-mustard-400">
                {formatToman(result.estimatedPrice)}
              </p>
              <p className="mb-4 text-xs text-white/40">
                قیمت پایه {formatToman(result.basePrice)} · مجموع کسر {result.totalDeductionPercent}٪
              </p>
              {result.breakdown.length > 0 && (
                <div className="mx-auto max-w-sm space-y-1.5 text-right">
                  {result.breakdown.map((b, i) => (
                    <div key={i} className="flex justify-between text-xs text-white/50">
                      <span>{b.label}</span>
                      <span className="font-mono text-red-400">{b.percent}٪</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-4 text-xs text-white/30">
                این مبلغ صرفاً تخمینی است. برای قیمت دقیق، به فروشگاه للهی مراجعه یا تماس بگیرید.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
