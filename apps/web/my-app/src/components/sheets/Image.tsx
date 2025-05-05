"use client";

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from "react";
import '../../components/examples/Page/ExamplePage.css';
import '../../components/examples/Page/Page.css';

import { Sheet } from "@silk-hq/components";
import ImageComponent from '../pages/Image';

export default function ImageSheetWrapper() {
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
        license="non-commercial" 
        presented={presented}
        onPresentedChange={handlePresentedChange}>
            <Sheet.Portal>
            <Sheet.View
               className="Card-view"
               contentPlacement="center"
               tracks={["bottom", "top"]}
               style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50 }}
               enteringAnimationSettings={{
                  easing: "spring",
                  stiffness: 260,
                  damping: 25,
                  mass: 1,
               }}
               nativeEdgeSwipePrevention={true}
            >
                <Sheet.Backdrop className="Page-backdrop"
                  travelAnimation={{ opacity: [0, 1] }}                
                />
                <Sheet.Content className="Page-content" aria-label="Image content">
                  <ImageComponent />
                </Sheet.Content>
              </Sheet.View>
            </Sheet.Portal>
                
    </Sheet.Root>
  );
} 