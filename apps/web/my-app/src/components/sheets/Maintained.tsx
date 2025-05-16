"use client";

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from "react";
import '../../components/examples/Page/ExamplePage.css';
import '../../components/examples/Page/Page.css';

import { Sheet } from "@silk-hq/components";
import Maintained from '../pages/Maintained';

export default function MaintainedSheetWrapper() {

  const router = useRouter();
  const [presented, setPresented] = useState(false);
  
  // Auto-present sheet on mount
  useEffect(() => {
    setPresented(true);
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
        style={{ position: 'fixed', height: '100%', width: '100%', pointerEvents: presented ? 'auto' : 'none' }}>
            <Sheet.Portal>
            <Sheet.View
                className="Page-view"
                contentPlacement="right"
                swipeOvershoot={true}
                nativeEdgeSwipePrevention={true}
                style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50 }}
            >
                <Sheet.Backdrop className="Page-backdrop" />
                <Sheet.Content className="Page-content">
                  <Maintained isIntercepted={true} />
                </Sheet.Content>
              </Sheet.View>
            </Sheet.Portal>
                
    </Sheet.Root>
  );
} 