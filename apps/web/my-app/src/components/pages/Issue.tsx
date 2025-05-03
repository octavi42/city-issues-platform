"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from 'next/navigation';
import { Sheet } from "@silk-hq/components";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Calendar, MapPin, AlertTriangle, X } from "lucide-react";
import { fetchDetectionEventById, fetchPhotoByEventId } from "@/lib/neo4j-queries";
import { DetectionEvent } from "@/lib/neo4j-schema";
import { format } from "date-fns";
import Image from "next/image";

interface PhotoData {
  photo_id?: string;
  url?: string;
  created_at?: string;
  event_id?: string;
}

interface Comment {
  user: string;
  date: string;
  text: string;
}

interface IssueData {
  name: string;
  description: string;
  imageUrl: string;
  severity: string;
  date: string;
  location: string;
  user: string;
  suggestions: string[];
  comments: Comment[];
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

const Issue = () => {
    const router = useRouter();
    const pathname = usePathname();
    const mountedRef = useRef(false);
    const [loading, setLoading] = useState(true);
    const [eventData, setEventData] = useState<DetectionEvent | null>(null);
    const [photoData, setPhotoData] = useState<PhotoData | null>(null);
    const [issueData, setIssueData] = useState<IssueData>({
      name: "Loading...",
      description: "",
      imageUrl: "",
      severity: "medium",
      date: "Today",
      location: "Unknown",
      user: "Anonymous",
      suggestions: [],
      comments: []
    });
    
    // Extract event ID from the path
    const getEventIdFromPath = useCallback(() => {
      // Extract the last part of the path (after the last slash)
      const pathParts = pathname.split('/');
      return pathParts[pathParts.length - 1];
    }, [pathname]);
    
    // Ensure component is mounted before animations run
    useEffect(() => {
      mountedRef.current = true;
      
      return () => {
        mountedRef.current = false;
      };
    }, []);
    
    // Fetch detection event data and associated photo
    useEffect(() => {
      const fetchEventData = async () => {
        try {
          const eventId = getEventIdFromPath();
          console.log("Fetching event data for ID:", eventId);
          
          // Skip fetch if ID is clearly not a valid event ID (like "issue-1")
          if (eventId.startsWith("issue-")) {
            setLoading(false);
            return;
          }
          
          // Fetch the event data
          const event = await fetchDetectionEventById(eventId);
          console.log("Fetched event:", event);
          
          // Fetch the associated photo
          const photo = await fetchPhotoByEventId(eventId);
          console.log("Fetched photo:", photo);
          setPhotoData(photo);
          
          if (event) {
            setEventData(event);
            
            // Format the date if available
            let formattedDate = "Today";
            if (event.reported_at) {
              try {
                formattedDate = format(new Date(event.reported_at), 'MMM d, yyyy');
              } catch (e) {
                console.error("Error formatting date:", e);
              }
            }
            
            // Map event data to issue display format
            setIssueData({
              name: event.name || "Untitled Issue",
              description: event.description || "No description provided for this issue.",
              imageUrl: photo?.url || `/images/${eventId}.jpg`, // Use photo URL if available, otherwise fallback
              severity: event.severity || "medium",
              date: formattedDate,
              location: "From database", // Would come from a location relationship in real implementation
              user: "Reporter", // Would come from the REPORTED_BY relationship
              suggestions: [],
              comments: []
            });
          }
          
          // Add a small delay before showing content to ensure data is processed
          setTimeout(() => {
            if (mountedRef.current) {
              setLoading(false);
            }
          }, 300);
        } catch (error) {
          console.error("Error fetching event data:", error);
          setLoading(false);
        }
      };
      
      fetchEventData();
    }, [pathname, getEventIdFromPath]);
  
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
    const comments = issueData.comments?.length > 0 ? issueData.comments : sampleComments;
  
    return (
      <div className="relative h-full overflow-auto">
            {loading ? (
              <div className="w-full h-full">
                {/* Image Skeleton */}
                <Skeleton className="w-full aspect-[3/2] mb-16" />
                
                <div className="px-8 md:px-10">
                  {/* Title Skeleton - just one for the title */}
                  <div className="sticky top-0 z-[51] py-6 bg-white/90 backdrop-blur-sm mb-20">
                    <Skeleton className="h-9 w-2/3" />
                  </div>
                  
                  {/* Description Skeleton - just two lines */}
                  <div className="mb-28">
                    <Skeleton className="h-5 w-full mb-3" />
                    <Skeleton className="h-5 w-4/5" />
                  </div>
                  
                  {/* Details Skeleton - section title and simplified content */}
                  <div className="mb-28">
                    <Skeleton className="h-7 w-32 mb-3" />
                    <div className="bg-gray-50 rounded-2xl p-4">
                      {/* Just two key details instead of four */}
                      <div className="flex items-center justify-between h-10 mb-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <div className="flex items-center justify-between h-10">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Suggestions Skeleton - section title and simplified content */}
                  <div className="mb-28">
                    <Skeleton className="h-7 w-32 mb-3" />
                    <div className="bg-gray-50 rounded-2xl p-4 pl-10">
                      {/* Just two suggestions */}
                      <Skeleton className="h-5 w-3/4 mb-5" />
                      <Skeleton className="h-5 w-2/3" />
                    </div>
                  </div>
                  
                  {/* Comments Skeleton - section title and one comment */}
                  <div className="mb-28">
                    <Skeleton className="h-7 w-32 mb-3" />
                    
                    {/* Just one comment */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between pb-3">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-3 w-12" />
                      </div>
                      <Skeleton className="h-10 w-full" />
                    </div>
                    
                    {/* Comment button */}
                    <Skeleton className="w-full h-12 rounded-xl" />
                  </div>
                  
                  {/* Bottom spacing */}
                  <div className="h-20"></div>
                </div>
              </div>
            ) : (
              <>
                {/* Header image - scrolls with content */}
                <div className="w-full aspect-[3/2] bg-gray-50 mb-16 z-[100] relative">
                  <Image 
                    src={issueData.imageUrl || "https://placehold.co/600x400/e6e6e6/a6a6a6?text=Issue+Image"} 
                    alt={issueData.name} 
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Main content with distinct spacing between sections */}
                <div className="px-8 md:px-10">
                {/* Sticky title bar with close button */}
                <div className="sticky top-0 z-[51] flex items-center justify-between py-6 bg-white/90 backdrop-blur-sm mb-20">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">{issueData.name}</h2>
                    <Sheet.Trigger 
                    action="dismiss"
                    onClick={() => {
                        // Calculate parent path (remove the last segment)
                        // const parentPath = pathname.substring(0, pathname.lastIndexOf('/'));
                        router.replace(`/categories/flooding`); // Replace state instead of pushing
                    }}
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
                    {issueData.description}
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
                        <Badge className={`text-sm py-1.5 px-4 border ${getSeverityColor(issueData.severity)}`}>
                        {issueData.severity.charAt(0).toUpperCase() + issueData.severity.slice(1)}
                        </Badge>
                    </div>
                    
                    {/* Date */}
                    <div className="flex items-center justify-between h-10">
                        <div className="flex items-center gap-4 text-base text-gray-600">
                        <Calendar className="h-5 w-5" />
                        <span>Reported on</span>
                        </div>
                        <span className="text-base font-medium">{issueData.date}</span>
                    </div>
                    
                    {/* Location */}
                    <div className="flex items-center justify-between h-10">
                        <div className="flex items-center gap-4 text-base text-gray-600">
                        <MapPin className="h-5 w-5" />
                        <span>Location</span>
                        </div>
                        <span className="text-base font-medium">{issueData.location}</span>
                    </div>
                    
                    {/* Reporter */}
                    <div className="flex items-center justify-between h-10">
                        <div className="flex items-center gap-4 text-base text-gray-600">
                        <Avatar className="h-5 w-5" />
                        <span>Reported by</span>
                        </div>
                        <span className="text-base font-medium">{issueData.user}</span>
                    </div>
                    
                    {/* Event ID (if available) */}
                    {eventData && (
                      <div className="flex items-center justify-between h-10">
                        <div className="flex items-center gap-4 text-base text-gray-600">
                          <span className="h-5 w-5 flex items-center justify-center">#</span>
                          <span>Event ID</span>
                        </div>
                        <span className="text-base font-medium">{eventData.event_id}</span>
                      </div>
                    )}
                    
                    {/* Photo ID (if available) */}
                    {photoData && photoData.photo_id && (
                      <div className="flex items-center justify-between h-10">
                        <div className="flex items-center gap-4 text-base text-gray-600">
                          <span className="h-5 w-5 flex items-center justify-center">📷</span>
                          <span>Photo ID</span>
                        </div>
                        <span className="text-base font-medium">{photoData.photo_id}</span>
                      </div>
                    )}
                    </div>
                </div>
                
                {/* Invisible spacer */}
                <div className="h-8 mb-28"></div>
                
                {/* 4. SUGGESTIONS COMPONENT */}
                <div className="mb-28">
                    <h3 className="text-xl font-medium text-gray-900 pb-3">Suggestions</h3>
                    <div className="bg-gray-50 rounded-2xl p-4">
                    <ul className="space-y-5 list-disc text-base text-gray-600 pl-6">
                        {issueData.suggestions?.length > 0 ? (
                          issueData.suggestions.map((suggestion: string, i: number) => (
                            <li key={i} className="leading-relaxed py-1">{suggestion}</li>
                          ))
                        ) : (
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
                    {comments.map((comment: Comment, i: number) => (
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
                </div>
              </>
            )}
        </div>
    );
  };

export default Issue;