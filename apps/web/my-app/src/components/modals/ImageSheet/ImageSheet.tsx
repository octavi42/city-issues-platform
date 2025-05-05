"use client";
import { Sheet } from "@silk-hq/components";
import { Card } from "@/components/examples/Card/Card";
import "./ExampleCard.css";
import Image from "next/image";

// import { SheetDismissButton } from "../_GenericComponents/SheetDismissButton/SheetDismissButton";

interface ImageData {
  imageUrl: string;
  issueText: string;
}

interface ImageSheetProps {
  imageData: ImageData;
  imageHeight: string;
}

const ImageSheet = ({ imageData, imageHeight }: ImageSheetProps) => {
  return (
    <Card
      presentTrigger={
        <Sheet.Trigger
          travelAnimation={{ scale: [1, 0.95] }}
          asChild
        >
          <div className={`relative w-full ${imageHeight}`}>
                <Image 
                    src={imageData.imageUrl} 
                    alt={imageData.issueText} 
                    fill
                    style={{ objectFit: 'cover' }}
                />
            </div>
        </Sheet.Trigger>
      }
      sheetContent={
        <>
          <Sheet.Trigger
            className="p-4 bg-black rounded-full text-white"
            action="dismiss"
            style={{
              position: 'fixed',
              top: '-100px',
              right: '20px',
              zIndex: 10000,
              fontSize: '24px',
              width: '70px',
              height: '70px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </Sheet.Trigger>
          <div className="w-full h-full">
            <Image 
              src={imageData.imageUrl} 
              alt={imageData.issueText} 
              fill
              style={{ objectFit: 'contain' }}
              quality={100}
            />
          </div>
        </>
      }
    />
  );
};

export { ImageSheet };
