"use client";

import dynamic from "next/dynamic";
import { DotPulseLoader } from "@/components/ui/Skeleton";

const Logo3DShowcase = dynamic(() => import("./Logo3DShowcase").then((m) => m.Logo3DShowcase), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-square w-full max-w-md mx-auto items-center justify-center">
      <DotPulseLoader />
    </div>
  )
});

export function Logo3DShowcaseLoader() {
  return <Logo3DShowcase />;
}
