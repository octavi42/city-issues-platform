"use client";

import React from "react";
import { Sheet } from "@silk-hq/components";
import Image from "next/image";
import { Camera } from "lucide-react";

interface UserPhoto {
  photo_id: string;
  url?: string;
  title?: string;
  status: string;
  type: string;
}

interface CommentSheetProps {
  photo: UserPhoto;
}

const IrrelevantSheet = ({
  photo,
}: CommentSheetProps) => {
  
  return (
    <Sheet.Root 
      license="commercial"
    >
        <Sheet.Trigger color="blue">
            
            <div 
                key={photo.photo_id} 
                className={`bg-white rounded-2xl p-4 px-6 mb-4 border border-[#E0E0E0] flex justify-between items-center ${
                    photo.type !== 'in_progress' ? "cursor-pointer hover:shadow-md transition-shadow" : ""
                }`}
            >
                <div className="flex items-center gap-3">
                    {photo.url ? (
                        <div className="w-12 h-12 rounded-md overflow-hidden">
                            <Image src={photo.url} alt={photo.title || 'Reported item'} width={48} height={48} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-12 h-12 rounded-md bg-[#F7F7F7] flex items-center justify-center">
                            <Camera size={20} className="text-[#787575]" />
                        </div>
                    )}
                    <span className="text-base font-medium">{photo.title || 'Reported Item'}</span>
                </div>
                <span className={`inline-block py-1 px-3 rounded-2xl text-sm font-medium ${
                    photo.status === "Open" 
                        ? "bg-[#E6F0FF] text-[#075CDD]" 
                        : photo.status === "In Progress" 
                            ? "bg-[#F7F7E6] text-[#728019]" 
                            : photo.status === "Maintained"
                                ? "bg-[#E8F5E9] text-[#3B7B3B]"
                                : photo.status === "Irrelevant"
                                    ? "bg-[#FFE6E6] text-[#D10000]"
                                    : "bg-[#F7F7E6] text-[#728019]"
                }`}>
                    {photo.status}
                </span>
            </div>

        </Sheet.Trigger>
      <Sheet.Portal>
        <Sheet.View 
          className="z-[1000]" 
          contentPlacement="top" 
          nativeEdgeSwipePrevention={true}
          style={{
            /* Adding 60px to make it fully visible below iOS Safari's bottom UI */
            height: "calc(var(--silk-100-lvh-dvh-pct) + 60px)"
          }}
        >
          <Sheet.Backdrop />
          <Sheet.Content className="z-[1001] bg-white rounded-b-[1.875rem] p-6 fixed top-0 left-0 right-0 shadow-lg">
            
            

          </Sheet.Content>
        </Sheet.View>
      </Sheet.Portal>
    </Sheet.Root>
  );
};

export default IrrelevantSheet;