import { useCallback, useState, useEffect, useRef } from "react";
import { Sheet, Scroll } from "@silk-hq/components";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Avatar } from "../../../components/ui/avatar";
import { MessageSquare, Calendar, MapPin, AlertTriangle, ChevronDown, X } from "lucide-react";

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

// Sample comments to display when no comments are provided
const sampleComments = [
  {
    user: "Sarah J.",
    date: "Today",
    text: "The broken bench poses a safety risk for the elderly."
  },
  {
    user: "Michael C.",
    date: "Yesterday",
    text: "Parks department added this to their maintenance schedule."
  },
  {
    user: "Emily R.",
    date: "2d ago",
    text: "Third damaged bench in this area. Maybe we need better lighting."
  }
];

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

  // Use provided comments or sample comments
  const comments = data.comments?.length > 0 ? data.comments : sampleComments;

  return (
    <SheetWithStackingView onTravelStatusChange={travelStatusChangeHandler}>
      <Scroll.Root className="h-full" asChild>
        <Scroll.View
          scrollGestureTrap={{ yEnd: true }}
          onScroll={handleScroll}
          className="h-full"
        >
          <Scroll.Content className="pb-32">
            {/* Header image - scrolls with content */}
            <div className="w-full aspect-[3/2] bg-gray-50 mb-16">
              <img 
                src={data.imageUrl || "https://placehold.co/600x400/e6e6e6/a6a6a6?text=Issue+Image"} 
                alt={data.name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Main content with distinct spacing between sections */}
            <div className="px-8 md:px-10">
              {/* Sticky title bar with close button */}
              <div className="sticky top-0 z-[51] flex items-center justify-between py-6 bg-white/90 backdrop-blur-sm mb-20">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">{data.name}</h2>
                <Sheet.Trigger 
                  action="dismiss"
                  className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="h-4 w-4 text-gray-700" />
                </Sheet.Trigger>
              </div>
              
              {/* Invisible spacer - no longer need the pt-4 from the old title div */}
              <div className="h-8 mb-28"></div>
              
              {/* 2. DESCRIPTION COMPONENT */}
              <div className="mb-28">
                <p className="text-lg text-gray-600 leading-relaxed">
                  {data.description || "No description provided for this issue."}
                </p>
              </div>
              
              {/* Invisible spacer */}
              <div className="h-8 mb-28"></div>
              
              {/* 3. DETAILS COMPONENT */}
              <div className="mb-28">
                <h3 className="text-xl font-medium text-gray-900 pb-3">Issue Details</h3>
                <div className="bg-gray-50 rounded-2xl p-4">
                  {/* Severity */}
                  <div className="flex items-center justify-between h-10">
                    <div className="flex items-center gap-4 text-base text-gray-600">
                      <AlertTriangle className="h-5 w-5" />
                      <span>Severity</span>
                    </div>
                    <Badge className={`text-sm py-1.5 px-4 border ${getSeverityColor(data.severity || 'medium')}`}>
                      {data.severity || 'Medium'}
                    </Badge>
                  </div>
                  
                  {/* Date */}
                  <div className="flex items-center justify-between h-10">
                    <div className="flex items-center gap-4 text-base text-gray-600">
                      <Calendar className="h-5 w-5" />
                      <span>Reported on</span>
                    </div>
                    <span className="text-base font-medium">{data.date || 'Today'}</span>
                  </div>
                  
                  {/* Location */}
                  <div className="flex items-center justify-between h-10">
                    <div className="flex items-center gap-4 text-base text-gray-600">
                      <MapPin className="h-5 w-5" />
                      <span>Location</span>
                    </div>
                    <span className="text-base font-medium">{data.location || 'Unknown'}</span>
                  </div>
                  
                  {/* Reporter */}
                  <div className="flex items-center justify-between h-10">
                    <div className="flex items-center gap-4 text-base text-gray-600">
                      <Avatar className="h-5 w-5" />
                      <span>Reported by</span>
                    </div>
                    <span className="text-base font-medium">{data.user || 'Anonymous'}</span>
                  </div>
                </div>
              </div>
              
              {/* Invisible spacer */}
              <div className="h-8 mb-28"></div>
              
              {/* 4. SUGGESTIONS COMPONENT */}
              <div className="mb-28">
                <h3 className="text-xl font-medium text-gray-900 pb-3">Suggestions</h3>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <ul className="space-y-5 list-disc text-base text-gray-600 pl-6">
                    {data.suggestions?.map((suggestion: string, i: number) => (
                      <li key={i} className="leading-relaxed py-1">{suggestion}</li>
                    )) || (
                      <>
                        <li className="leading-relaxed py-1">Contact local maintenance team</li>
                        <li className="leading-relaxed py-1">Take photos of the area for documentation</li>
                        <li className="leading-relaxed py-1">Avoid the area until resolved</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
              
              {/* Invisible spacer */}
              <div className="h-8 mb-28"></div>
              
              {/* 5. COMMENTS COMPONENT */}
              <div className="mb-28">
                <h3 className="text-xl font-medium text-gray-900 pb-3">Comments</h3>
                
                {/* Comments list */}
                <div className="space-y-5 pb-3">
                  {comments.map((comment: any, i: number) => (
                    <div key={i} className="p-1">
                      <div className="bg-gray-50 rounded-xl p-2">
                        <div className="flex items-center justify-between pb-3">
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
                    </div>
                  ))}
                </div>
                
                {/* Add comment button */}
                <Button 
                  className="w-full gap-2 rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 h-12 text-sm"
                  variant="ghost"
                >
                  <MessageSquare className="h-4 w-4" />
                  Add Comment
                </Button>
              </div>
              
              {/* Additional space at bottom */}
              <div className="h-20"></div>
              
              {/* Nested sheet */}
              <SheetWithStackingRoot>
                {data.nestedSheet && (
                  <ExampleSheetWithStackingView data={data.nestedSheet} />
                )}
              </SheetWithStackingRoot>
            </div>
          </Scroll.Content>
        </Scroll.View>
      </Scroll.Root>
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
