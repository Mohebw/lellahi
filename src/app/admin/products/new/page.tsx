import { AdminShell } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "محصول جدید" };

export default function NewProductPage() {
  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-bold text-white">محصول جدید</h1>
      <ProductForm />
    </AdminShell>
  );
}
