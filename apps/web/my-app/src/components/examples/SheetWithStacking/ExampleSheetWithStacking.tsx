import { useCallback, useState, useEffect, useRef } from "react";
import { Sheet, Scroll } from "@silk-hq/components";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Avatar } from "../../../components/ui/avatar";
import { MessageSquare, Calendar, MapPin, AlertTriangle, ChevronDown } from "lucide-react";

import {
  SheetWithStackingStack,
  SheetWithStackingRoot,
  SheetWithStackingView,
} from "./SheetWithStacking";

import { SheetTriggerCard } from "../../app/SheetTriggerCard/SheetTriggerCard";

interface ExampleSheetWithStackingProps {
  data: any;
  trigger?: React.ReactNode;
  onClose?: () => void;
}

const ExampleSheetWithStackingView = ({ data }: any) => {
  const [isReady, setIsReady] = useState(false);
  const mountedRef = useRef(false);
  
  // Ensure component is mounted before animations run
  useEffect(() => {
    setIsReady(true);
    mountedRef.current = true;
    
    return () => {
      setIsReady(false);
      mountedRef.current = false;
    };
  }, []);
  
  const travelStatusChangeHandler = useCallback((travelStatus: string) => {
    if (!mountedRef.current || !isReady) return;
    
    if (travelStatus === "idleOutside")
      setTimeout(() => {
        if (mountedRef.current) {
          // Handle idle state
        }
      }, 10);
  }, [isReady]);

  const handleScroll = useCallback(({ distance }: { distance: number }) => {
    if (!isReady) return;
    // Handle scroll
  }, [isReady]);

  // Get severity badge style
  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <SheetWithStackingView onTravelStatusChange={travelStatusChangeHandler}>
      {/* Dismissal handle at top */}
      <div className="pt-4 pb-2 flex justify-center">
        <div className="w-10 h-1 bg-gray-200 rounded-full"></div>
      </div>
      
      <Scroll.Root className="h-full" asChild>
        <Scroll.View
          scrollGestureTrap={{ yEnd: true }}
          onScroll={handleScroll}
          className="h-full"
        >
          <Scroll.Content className="pb-16">
            {/* Header image - Full bleed with responsive height */}
            <div className="w-full aspect-[3/2] bg-gray-50 mb-8">
              <img 
                src={data.imageUrl || "https://placehold.co/600x400/e6e6e6/a6a6a6?text=Issue+Image"} 
                alt={data.name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Content container with increased padding */}
            <div className="px-6 md:px-8 space-y-8">
              {/* Title with more space */}
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">{data.name}</h2>
                
                {/* Description with increased spacing */}
                <p className="mt-4 text-base text-gray-600 leading-relaxed">
                  {data.description || "No description provided for this issue."}
                </p>
              </div>
              
              {/* Details in a clean, minimal card */}
              <div className="bg-gray-50 rounded-2xl p-6 space-y-5">
                <h3 className="font-medium text-gray-900 mb-4">Issue Details</h3>
                
                <div className="space-y-5">
                  {/* Severity */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Severity</span>
                    </div>
                    <Badge className={`border ${getSeverityColor(data.severity || 'medium')}`}>
                      {data.severity || 'Medium'}
                    </Badge>
                  </div>
                  
                  {/* Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Reported on</span>
                    </div>
                    <span className="text-sm font-medium">{data.date || 'Today'}</span>
                  </div>
                  
                  {/* Location */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>Location</span>
                    </div>
                    <span className="text-sm font-medium">{data.location || 'Unknown'}</span>
                  </div>
                  
                  {/* Reporter */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Avatar className="h-4 w-4" />
                      <span>Reported by</span>
                    </div>
                    <span className="text-sm font-medium">{data.user || 'Anonymous'}</span>
                  </div>
                </div>
              </div>
              
              {/* Suggestions with clean styling */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Suggestions</h3>
                <ul className="space-y-3 pl-5 list-disc text-sm text-gray-600">
                  {data.suggestions?.map((suggestion: string, i: number) => (
                    <li key={i} className="leading-relaxed">{suggestion}</li>
                  )) || (
                    <>
                      <li className="leading-relaxed">Contact local maintenance team</li>
                      <li className="leading-relaxed">Take photos of the area for documentation</li>
                      <li className="leading-relaxed">Avoid the area until resolved</li>
                    </>
                  )}
                </ul>
              </div>
              
              {/* Comments section with more space */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-medium text-gray-900">Comments</h3>
                  <span className="text-xs text-gray-500">{data.comments?.length || 0} comments</span>
                </div>
                
                <div className="space-y-5 mb-6">
                  {data.comments?.length > 0 ? (
                    data.comments.map((comment: any, i: number) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <div className="bg-blue-50 text-blue-700 w-full h-full flex items-center justify-center text-xs font-bold">
                                {comment.user?.charAt(0) || 'U'}
                              </div>
                            </Avatar>
                            <span className="text-sm font-medium">{comment.user}</span>
                          </div>
                          <span className="text-xs text-gray-500">{comment.date}</span>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-700">{comment.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No comments yet. Be the first to comment!
                    </div>
                  )}
                </div>
                
                {/* Add comment button - cleaner and more minimal */}
                <Button 
                  className="w-full gap-2 rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 h-12"
                  variant="ghost"
                >
                  <MessageSquare className="h-4 w-4" />
                  Add Comment
                </Button>
              </div>
              
              {/* Additional space at bottom */}
              <div className="h-8"></div>
              
              <SheetWithStackingRoot className="mt-8">
                {data.nestedSheet && (
                  <ExampleSheetWithStackingView data={data.nestedSheet} />
                )}
              </SheetWithStackingRoot>
            </div>
          </Scroll.Content>
        </Scroll.View>
      </Scroll.Root>
      
      {/* Removed the fixed component from the bottom as requested */}
    </SheetWithStackingView>
  );
};

const ExampleSheetWithStacking = ({ data, trigger }: ExampleSheetWithStackingProps) => {
  return (
    <SheetWithStackingStack>
      <SheetWithStackingRoot>
        {trigger ? (
          <Sheet.Trigger asChild>
            {trigger}
          </Sheet.Trigger>
        ) : (
          <SheetTriggerCard color="green">Sheet with Stacking</SheetTriggerCard>
        )}
        <ExampleSheetWithStackingView data={data} />
      </SheetWithStackingRoot>
    </SheetWithStackingStack>
  );
};

export { ExampleSheetWithStacking, ExampleSheetWithStackingView };
