"use client";

import { motion, useInView, Variants } from "framer-motion";
import { useRef, ElementType, ReactNode, RefObject } from "react";
import { cn } from "@/lib/utils";

interface TimelineContentProps {
  children?: ReactNode;
  as?: ElementType;
  animationNum?: number;
  timelineRef?: RefObject<HTMLDivElement | null>;
  className?: string;
  customVariants?: Variants;
  [key: string]: unknown;
}

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

export function TimelineContent({
  children,
  as: Tag = "div",
  animationNum = 1,
  timelineRef: _timelineRef,
  className,
  customVariants,
  ...rest
}: TimelineContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const variants = customVariants ?? defaultVariants;

  // Access framer-motion's built-in motion proxy for HTML elements
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MotionTag = (motion as any)[typeof Tag === "string" ? Tag : "div"] as React.ComponentType<any>;

  return (
    <MotionTag
      ref={ref}
      custom={animationNum}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={cn(className)}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
