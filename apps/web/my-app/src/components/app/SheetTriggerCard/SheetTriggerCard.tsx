"use client";

import React, { useCallback, useRef } from "react";
import { Sheet, SheetId } from "@silk-hq/components";
import Image from "next/image";

import "./SheetTriggerCard.css";

interface SheetTriggerCardProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  forComponent?: SheetId;
  thumbnail?: string;
  color?: string;
  // Allow additional DOM props
  [key: string]: unknown;
}

const SheetTriggerCard = ({
  children,
  className,
  href,
  forComponent,
  thumbnail,
  color,
  ...restProps
}: SheetTriggerCardProps) => {
  const rootRef = useRef<HTMLElement>(null);

  const Element = href ? "a" : "button";

  const pointerMoveHandler = useCallback((event: React.PointerEvent) => {
    if (!rootRef.current || event.pointerType !== "mouse") return;

    const rect = rootRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    rootRef.current.style.setProperty("--xPos", `${x}px`);
    rootRef.current.style.setProperty("--yPos", `${y}px`);
  }, []);

  // Extract href since it's not valid for Sheet.Trigger but we want to pass it to Element
  const triggerProps = { ...restProps };

  return (
    <Sheet.Trigger
      className={["SheetTriggerCard-root", `color:${color}`, className].join(
        " "
      )}
      travelAnimation={{ scale: [1, 0.95] }}
      forComponent={forComponent}
      onPointerMove={pointerMoveHandler}
      ref={rootRef}
      {...triggerProps}
      asChild
    >
      <Element href={href}>
        {thumbnail && (
          <Image
            className="SheetTriggerCard-image"
            src={thumbnail}
            alt={typeof children === 'string' ? children : 'Card thumbnail'}
            draggable="false"
            quality={100}
            sizes="(max-width: 615px) 85.5vw, (max-width: 899px) 49vw, 1083px"
            loading="eager"
          />
        )}
        <div className="SheetTriggerCard-innerShadowClipper">
          <div className="SheetTriggerCard-innerShadow" />
        </div>
        <div className={["SheetTriggerCard-text", `color:${color}`].join(" ")}>
          <span className="SheetTriggerCard-actualText">{children}</span>
        </div>
        <div className="SheetTriggerCard-glow" />
      </Element>
    </Sheet.Trigger>
  );
};

export { SheetTriggerCard };
