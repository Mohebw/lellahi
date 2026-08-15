export const metadata = {
  title: {
    default: "پنل مدیریت للهی",
    template: "%s | پنل مدیریت للهی"
  },
  robots: { index: false, follow: false }
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-surface-950 force-dark">{children}</div>;
}
