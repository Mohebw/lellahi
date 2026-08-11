"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { relativeTimeFa } from "@/lib/utils";

type Review = {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

function Stars({ rating, onSelect }: { rating: number; onSelect?: (n: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onSelect}
          onClick={() => onSelect?.(n)}
          className={onSelect ? "cursor-pointer" : "cursor-default"}
        >
          <Star className={`h-4 w-4 ${n <= rating ? "fill-mustard-400 text-mustard-400" : "text-white/20"}`} />
        </button>
      ))}
    </div>
  );
}

export function ReviewSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { show } = useToast();

  async function load() {
    const res = await fetch(`/api/reviews?productId=${productId}`);
    const data = await res.json();
    setReviews(data.reviews);
    setAverage(data.average);
    setCount(data.count);
  }

  useEffect(() => {
    load();
  }, [productId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, customerName: name, rating, comment })
      });
      const data = await res.json();
      if (!res.ok) {
        show(data.error || "خطا در ثبت نظر", "error");
        return;
      }
      show(data.message || "نظر شما ثبت شد", "success");
      setName("");
      setComment("");
      setRating(5);
      setFormOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">نظرات مشتریان</h2>
          {average !== null ? (
            <div className="mt-1 flex items-center gap-2">
              <Stars rating={Math.round(average)} />
              <span className="text-xs text-white/40">
                {average.toFixed(1)} از ۵ ({count} نظر)
              </span>
            </div>
          ) : (
            <p className="mt-1 text-xs text-white/40">هنوز نظری ثبت نشده</p>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={() => setFormOpen((v) => !v)}>
          <MessageSquarePlus className="h-4 w-4" />
          ثبت نظر
        </Button>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="glass-panel mb-4 flex flex-col gap-3 p-4">
          <Input label="نام شما" value={name} onChange={(e) => setName(e.target.value)} required />
          <div>
            <p className="mb-1.5 text-sm text-white/70">امتیاز</p>
            <Stars rating={rating} onSelect={setRating} />
          </div>
          <Textarea label="نظر شما" value={comment} onChange={(e) => setComment(e.target.value)} rows={3} required />
          <Button type="submit" loading={submitting} size="sm">
            ارسال نظر
          </Button>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {reviews.map((r) => (
          <div key={r.id} className="glass-panel p-4">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-medium text-white">{r.customerName}</span>
              <Stars rating={r.rating} />
            </div>
            <p className="text-sm text-white/60">{r.comment}</p>
            <p className="mt-1.5 text-xs text-white/30">{relativeTimeFa(new Date(r.createdAt))}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
