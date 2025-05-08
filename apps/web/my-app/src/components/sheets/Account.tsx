"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sheet, useClientMediaQuery } from "@silk-hq/components";
import "@/components/examples/DetachedSheet/ExampleDetachedSheet.css";
import "@/components/examples/SheetWithStacking/SheetWithStacking.css";
import Account from '../pages/Account';
// Removed CategoriesOverlay import as it's not used in the provided code snippet
// import CategoriesOverlay from '@/components/CategoriesOverlay';

export default function AccountSheetWrapper() {
  const router = useRouter();
  const [presented, setPresented] = useState(false);

  const largeViewport = useClientMediaQuery("(min-width: 700px)");
  const contentPlacement = largeViewport ? "right" : "bottom";

  // Auto-present sheet on mount
  useEffect(() => {
    const timer = setTimeout(() => setPresented(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Handle closing: set state and navigate back
  function handlePresentedChange(isPresented: boolean) {
    setPresented(isPresented);
    if (!isPresented) {
      // Delay navigation to allow closing animation
      setTimeout(() => {
        router.back();
      }, 300); 
    }
  }

  return (
    <Sheet.Root 
      license="non-commercial" 
      presented={presented}
      onPresentedChange={handlePresentedChange}
      style={{ position: 'fixed', height: '100%', width: '100%', pointerEvents: presented ? 'auto' : 'none' }}
    >
      <Sheet.Portal>
        <Sheet.View
            className={`SheetWithStacking-view`}
            contentPlacement={contentPlacement}
            nativeEdgeSwipePrevention={true}
            style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50 }}
        >
            <Sheet.Backdrop
            travelAnimation={{ opacity: [0, 0.33] }}
            themeColorDimming="auto"
            />
            <Sheet.Content
            className={`SheetWithStacking-content contentPlacement-${contentPlacement}`}
            >
            <div className="SheetWithStacking-innerContent">
                <Account isIntercepted={true} />
            </div>
            </Sheet.Content>
        </Sheet.View>
    </Sheet.Portal>
    </Sheet.Root>
  );
}