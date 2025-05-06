"use client";

import React, { useEffect, useState } from "react";
import { Sheet } from "@silk-hq/components";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageSquare, AlertTriangle } from "lucide-react";

interface CommentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commentText: string;
  onCommentTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
}

const CommentSheet = ({
  open,
  onOpenChange,
  commentText,
  onCommentTextChange,
  onSubmit,
}: CommentSheetProps) => {
  const [presentedState, setPresentedState] = React.useState(false);
  const [isReportMode, setIsReportMode] = useState(false);
  
  // Sync the open state from props to the presented state
  useEffect(() => {
    if (open !== presentedState) {
      setPresentedState(open);
    }
  }, [open, presentedState]);
  
  // Handle presented state change
  const handlePresentedChange = (presented: boolean) => {
    setPresentedState(presented);
    onOpenChange(presented);
  };
  
  const handleCancel = () => {
    // Close the sheet
    setPresentedState(false);
    onOpenChange(false);
  };
  
  const toggleMode = () => {
    setIsReportMode(!isReportMode);
  };
  
  return (
    <Sheet.Root 
      license="commercial" 
      presented={presentedState}
      onPresentedChange={handlePresentedChange}
    >
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
          <Sheet.Backdrop onClick={() => onOpenChange(false)} />
          <Sheet.Content className="z-[1001] bg-white rounded-b-[1.875rem] p-6 fixed top-0 left-0 right-0 shadow-lg">
            
            <div className="flex justify-between items-center mb-6 mt-4">
              <div className="flex flex-col">
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  {isReportMode ? (
                    <AlertTriangle size={20} className="text-red-500" />
                  ) : (
                    <MessageSquare size={20} />
                  )}
                  {isReportMode ? "Add Report" : "Add Comment"}
                </h2>
                <p className="text-[0.9375rem] text-[#787575]">
                  {isReportMode 
                    ? "Report an issue related to this content" 
                    : "Share your thoughts about this issue"
                  }
                </p>
              </div>
              
              <button 
                onClick={toggleMode} 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F7F7F7] hover:bg-[#EFEFEF] transition-colors"
                aria-label={isReportMode ? "Switch to comment mode" : "Switch to report mode"}
              >
                {isReportMode ? (
                  <MessageSquare size={18} className="text-[#333]" />
                ) : (
                  <AlertTriangle size={18} className="text-red-500" />
                )}
              </button>
            </div>
            
            <div className="bg-[#F7F7F7] rounded-[1.875rem] p-6 mb-6">
              <Textarea 
                placeholder={isReportMode ? "Describe the issue..." : "Type your comment here..."} 
                className="resize-none text-base h-[120px] w-full bg-transparent border-none focus:ring-0 focus:outline-none p-0 text-[#333]"
                value={commentText}
                onChange={onCommentTextChange}
              />
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                className="flex-1 py-3 text-base font-semibold rounded-2xl border border-[#E0E0E0] text-[#333] hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Sheet.Trigger action="dismiss" asChild>
                <Button 
                  onClick={onSubmit}
                  disabled={!commentText.trim()}
                  className={`flex-1 py-3 text-base font-semibold rounded-2xl border-none gap-2 ${
                    isReportMode 
                      ? "bg-red-500 hover:bg-red-600 disabled:bg-red-300" 
                      : "bg-[#97b9ff] hover:bg-[#7da7f8] disabled:bg-[#c6d7f9]"
                  } text-white`}
                >
                  <Send className="h-4 w-4" />
                  {isReportMode ? "Send Report" : "Send"}
                </Button>
              </Sheet.Trigger>
            </div>
          </Sheet.Content>
        </Sheet.View>
      </Sheet.Portal>
    </Sheet.Root>
  );
};

export default CommentSheet; 