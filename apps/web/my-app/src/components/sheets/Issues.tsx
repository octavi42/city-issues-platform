"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sheet, useClientMediaQuery } from "@silk-hq/components";
import "@/components/examples/DetachedSheet/ExampleDetachedSheet.css";
import "@/components/examples/SheetWithStacking/SheetWithStacking.css";
import Issue from '../pages/Issue';
// Removed CategoriesOverlay import as it's not used in the provided code snippet
// import CategoriesOverlay from '@/components/CategoriesOverlay';

export default function IssueSheetWrapper() {
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


  // Create dummy data for the 'data' prop
  const dummyData = {
    id: "issue",
    category: "slug",
    title: `Issue dasdsa`,
    description: 'This is dummy content for the issue.',
    // Add other fields expected by ExampleSheetWithStackingProps if known
  };

  return (
    <Sheet.Root 
      license="non-commercial" 
      presented={presented}
      onPresentedChange={handlePresentedChange}
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
                <Issue data={dummyData} />
            </div>
            </Sheet.Content>
        </Sheet.View>
    </Sheet.Portal>
    </Sheet.Root>
  );
}