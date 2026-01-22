"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function MobileViewContent() {
  const searchParams = useSearchParams();
  const src = searchParams.get("src");
  const width = Number(searchParams.get("width")) || 390;
  const height = Number(searchParams.get("height")) || 844;
  const title = searchParams.get("title") || "Mobile Preview";
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      // Only scale on desktop (md breakpoint is 768px)
      if (window.innerWidth >= 768) {
        // Calculate max available height (90vh to leave some padding)
        const maxH = window.innerHeight * 0.9;
        // Calculate max available width (90vw)
        const maxW = window.innerWidth * 0.9;
        
        // We need to account for the border width (approx 16px total)
        const totalW = width + 16;
        const totalH = height + 16;

        const scaleH = maxH / totalH;
        const scaleW = maxW / totalW;
        
        // Use the smaller scale to fit both dimensions
        setScale(Math.min(1, scaleH, scaleW));
      } else {
        setScale(1);
      }
    };
    
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [width, height]);

  if (!src) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-zinc-500">
        No source provided
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-black md:bg-zinc-100 md:dark:bg-zinc-900 p-0 md:p-4 overflow-hidden">
      <div
        className="w-full h-[100dvh] md:w-auto md:h-auto bg-white dark:bg-black md:shadow-2xl md:rounded-[3rem] border-0 md:border-[8px] md:border-zinc-900 overflow-hidden relative origin-center transition-transform duration-200 ease-out"
        style={{
          "--phone-w": `${width}px`,
          "--phone-h": `${height}px`,
          transform: `scale(${scale})`,
        } as React.CSSProperties}
      >
        <div 
          className="w-full h-full md:w-[var(--phone-w)] md:h-[var(--phone-h)]"
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
