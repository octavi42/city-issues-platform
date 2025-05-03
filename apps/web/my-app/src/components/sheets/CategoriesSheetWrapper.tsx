"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sheet } from "@silk-hq/components";
import "@/components/examples/DetachedSheet/ExampleDetachedSheet.css";
// Removed CategoriesOverlay import as it's not used in the provided code snippet
// import CategoriesOverlay from '@/components/CategoriesOverlay';

export default function CategoriesSheetWrapper() {
  const router = useRouter();
  const [presented, setPresented] = useState(false);

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
      license="commercial" 
      presented={presented}
      onPresentedChange={handlePresentedChange}
    >
      <Sheet.Portal>
        <Sheet.View
          className="DetachedSheet-view contentPlacement-center"
          contentPlacement="center"
          tracks={["top", "bottom"]}
          nativeEdgeSwipePrevention
          style={{ background: 'transparent !important' }} 
        >
          <Sheet.Backdrop 
            travelAnimation={{
              // Make backdrop fully transparent
              opacity: () => 0,
            }}
            // Remove themeColorDimming to ensure no color overlay
            // themeColorDimming="auto" 
          />
          <Sheet.Content 
            className="DetachedSheet-content"
            style={{ background: 'transparent !important', boxShadow: 'none !important' }}
          >
            {/* Apply transparent background to inner content div as well */}
            <div 
              className="DetachedSheet-innerContent ExampleDetachedSheet-root" 
              style={{ background: 'transparent !important' }}
            >
              <Sheet.Handle
                className="ExampleDetachedSheet-handle"
                action="dismiss"
              />
              {/* Placeholder content - replace with actual categories content */}
              <div className="p-4 text-white">
                 Placeholder for Categories Content (e.g., CategoriesOverlay)
                 Replace &quot;aslkhdj&quot; with your actual content.
              </div>
              {/* aslkhdj - Assuming this was temporary */}
              <Sheet.Trigger
                className="ExampleDetachedSheet-validateTrigger"
                action="dismiss"
              >
                Close
              </Sheet.Trigger>
            </div>
          </Sheet.Content>
        </Sheet.View>
      </Sheet.Portal>
    </Sheet.Root>
  );
} 