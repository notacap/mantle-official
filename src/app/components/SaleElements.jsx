"use client";

import Image from "next/image";
import { saleConfig, getSaleEndLabel } from "@/config/saleConfig";

// Shared look for every sale surface: homepage banner, specials page, product pages
export const saleSurfaceClass =
  "relative isolate overflow-hidden bg-[#050505] text-white font-[family-name:var(--font-geist-sans)]";

export const saleButtonClass =
  "inline-flex min-h-11 items-center rounded bg-[#9CB24D] px-6 text-[0.9375rem] font-semibold text-black transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

const markSizes = {
  sm: { mark: "gap-1.5", number: "text-[4rem]", suffix: "text-[1.625rem]" },
  lg: { mark: "gap-2", number: "text-[5.5rem] lg:text-[8rem]", suffix: "text-[2.25rem] lg:text-[3.25rem]" },
  xl: { mark: "gap-2 lg:gap-3", number: "text-[7rem] lg:text-[12rem]", suffix: "text-[2.75rem] lg:text-[4.75rem]" },
};

export function SaleDiscountMark({ size = "lg" }) {
  const { mark, number, suffix } = markSizes[size];

  return (
    <span className={`flex items-center font-extrabold leading-none tracking-[-0.05em] tabular-nums ${mark}`}>
      <span className={number}>{saleConfig.discount}</span>
      <span className={`flex flex-col gap-1 leading-[0.9] ${suffix}`}>
        <span className="text-[#9CB24D]">%</span>
        <span>off</span>
      </span>
    </span>
  );
}

// Decorative photo, faded into the background at its edges
export function SalePhoto({ className = "lg:w-[420px]" }) {
  return (
    <div
      className={`absolute inset-y-0 right-0 -z-10 w-[48%] opacity-60 [mask-image:linear-gradient(to_right,transparent,black_60%)] md:w-[38%] md:opacity-100 md:[mask-image:linear-gradient(to_right,transparent,black_30%,black_70%,transparent)] lg:right-[max(0px,calc(50%-640px))] ${className}`}
    >
      <Image
        src={saleConfig.banner.image}
        alt=""
        fill
        priority
        sizes="(min-width: 768px) 640px, 400px"
        className="object-cover"
        style={{ objectPosition: saleConfig.banner.imagePosition }}
      />
    </div>
  );
}

// End date, or a live countdown on the last day
export function SaleEnds({ timeLeft }) {
  if (!timeLeft || timeLeft.days > 0) return `Ends ${getSaleEndLabel()}.`;

  return (
    <>
      Ends in{" "}
      <span className="tabular-nums text-white">
        {[timeLeft.hours, timeLeft.minutes, timeLeft.seconds]
          .map((value) => String(value).padStart(2, "0"))
          .join(":")}
      </span>
    </>
  );
}
