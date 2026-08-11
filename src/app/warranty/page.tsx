import type { Metadata } from "next";
import { ShieldCheck, RotateCcw, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "گارانتی و شرایط مرجوعی",
  description: "شرایط گارانتی و بازگشت کالا در فروشگاه للهی آمل."
};

export default function WarrantyPage() {
  return (
    <div className="container-lellahi py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold text-white">گارانتی و شرایط مرجوعی</h1>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="glass-panel p-5 text-center">
            <ShieldCheck className="mx-auto mb-2 h-6 w-6 text-mustard-400" />
            <h3 className="mb-1 text-sm font-semibold text-white">گارانتی اصالت</h3>
            <p className="text-xs text-white/50">تمام کالاها دارای ضمانت اصالت کالا هستند</p>
          </div>
          <div className="glass-panel p-5 text-center">
            <RotateCcw className="mx-auto mb-2 h-6 w-6 text-mustard-400" />
            <h3 className="mb-1 text-sm font-semibold text-white">۷ روز مهلت بازگشت</h3>
            <p className="text-xs text-white/50">در صورت عدم مطابقت کالا با توضیحات</p>
          </div>
          <div className="glass-panel p-5 text-center">
            <Clock className="mx-auto mb-2 h-6 w-6 text-mustard-400" />
            <h3 className="mb-1 text-sm font-semibold text-white">پشتیبانی مستمر</h3>
            <p className="text-xs text-white/50">پاسخگویی به سوالات پس از خرید</p>
          </div>
        </div>

        <div className="glass-panel space-y-4 p-6 leading-8 text-white/70">
          <p>
            تمامی محصولات فروشگاه للهی پیش از فروش به‌صورت کامل بررسی و تست می‌شوند و توضیحات
            وضعیت هر کالا (نو یا کارکرده) به‌صورت شفاف در صفحه‌ی محصول ذکر می‌شود.
          </p>
          <p>
            در صورتی که کالای دریافتی با توضیحات ثبت‌شده مطابقت نداشته باشد، مشتری می‌تواند
            ظرف مدت ۷ روز از تاریخ تحویل، با فروشگاه تماس بگیرد تا موضوع بررسی و در صورت
            تایید، کالا تعویض یا مبلغ بازگشت داده شود.
          </p>
          <p>
            گارانتی محصولات نو، طبق شرایط گارانتی رسمی همان محصول است. برای محصولات کارکرده،
            شرایط گارانتی فروشگاهی در زمان خرید به مشتری اطلاع داده می‌شود.
          </p>
          <p>
            برای هرگونه سوال یا پیگیری، از طریق شماره تماس یا واتساپ فروشگاه با ما در ارتباط
            باشید.
          </p>
        </div>
      </div>
    </div>
  );
}
