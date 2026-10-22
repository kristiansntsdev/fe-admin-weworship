import type { ReactNode } from "react";

import { BottomNav } from "../_components/bottom-nav";

export default function PrototypeAppLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <main className="flex flex-1 flex-col pb-[calc(4rem+env(safe-area-inset-bottom))]">{children}</main>
      <BottomNav />
    </>
  );
}
