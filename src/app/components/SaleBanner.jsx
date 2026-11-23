"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { saleConfig, isSaleActive, getTimeRemaining } from "@/config/saleConfig";
import { SaleDiscountMark, SaleEnds, SalePhoto, saleButtonClass, saleSurfaceClass } from "./SaleElements";

// `initialActive` comes from the server so the banner is in the first paint (no
// layout shift) and hydration always matches the HTML, even if that HTML is cached.
export default function SaleBanner({ initialActive = false }) {
  const [isVisible, setIsVisible] = useState(initialActive);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    function tick() {
      setIsVisible(isSaleActive());
      setTimeLeft(getTimeRemaining());
    }

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  const { name, messaging, navLink } = saleConfig;

  return (
    <section aria-label={`${name} sale`} className={saleSurfaceClass}>
      <SalePhoto />
      <div className="container-custom flex flex-col gap-5 py-7 md:min-h-[230px] md:flex-row md:items-center md:gap-10 md:py-8">
        <SaleDiscountMark />
        <div className="flex flex-col items-start gap-4">
          <div>
            <p className="m-0 text-xl font-semibold tracking-tight lg:text-2xl">
              {messaging.bannerHeadline}
            </p>
            <p className="m-0 mt-1 text-sm text-neutral-300 lg:text-base">
              No code needed. <SaleEnds timeLeft={timeLeft} />
            </p>
          </div>
          <Link href={navLink.href} className={saleButtonClass}>
            {messaging.bannerCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
