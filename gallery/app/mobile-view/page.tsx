"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function MobileViewContent() {
  const searchParams = useSearchParams();
  const src = searchParams.get("src");
  const width = Number(searchParams.get("width")) || 390;
  const height = Number(searchParams.get("height")) || 844;
  const title = searchParams.get("title") || "Mobile Preview";

  if (!src) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-zinc-500">
        No source provided
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-black md:bg-zinc-100 md:dark:bg-zinc-900 p-0 md:p-4">
      <div
        className="w-full h-[100dvh] md:w-auto md:h-auto bg-white dark:bg-black md:shadow-2xl md:rounded-[3rem] border-0 md:border-[8px] md:border-zinc-900 overflow-hidden relative"
        style={{
          "--phone-w": `${width}px`,
          "--phone-h": `${height}px`,
          // Only apply width/height on desktop via CSS variable usage or media query logic
          // Since we can't use media queries in inline styles easily, we use CSS variables and Tailwind arbitrary values
        } as React.CSSProperties}
      >
        <div 
          className="w-full h-full md:w-[var(--phone-w)] md:h-[var(--phone-h)] md:max-w-full md:max-h-[85vh]"
        >
          <iframe
            src={src}
            className="w-full h-full border-none bg-white dark:bg-black"
            title={`${title} Preview`}
          />
        </div>
      </div>
    </div>
  );
}

export default function MobileViewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MobileViewContent />
    </Suspense>
  );
}
