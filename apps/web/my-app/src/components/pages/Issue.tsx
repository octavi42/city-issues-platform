"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Calendar, MapPin, AlertTriangle } from "lucide-react";
import { fetchDetectionEventById, fetchPhotoByEventId } from "@/lib/neo4j-queries";
import { DetectionEvent } from "@/lib/neo4j-schema";
import { format } from "date-fns";
import Image from "next/image";
import CommentSheet from "@/components/sheets/CommentSheet";

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
    const pathname = usePathname();
    const mountedRef = useRef(false);
    const [loading, setLoading] = useState(true);
    const [eventData, setEventData] = useState<DetectionEvent | null>(null);
    const [photoData, setPhotoData] = useState<PhotoData | null>(null);
    const [commentSheetOpen, setCommentSheetOpen] = useState(false);
    const [newCommentText, setNewCommentText] = useState("");
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
  
    // Handle comment submission
    const handleCommentSubmit = () => {
      if (!newCommentText.trim()) return;
      
      const newComment = {
        user: "You",
        date: "Just now",
        text: newCommentText
      };
      
      // Add the new comment to the list
      setIssueData(prev => ({
        ...prev,
        comments: [...(prev.comments?.length ? prev.comments : []), newComment]
      }));
      
      // Clear the input and close the sheet
      setNewCommentText("");
      setCommentSheetOpen(false);
    };

    // Handle comment text change
    const handleCommentTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNewCommentText(e.target.value);
    };

    return (
      <div className="relative h-full overflow-auto bg-white">
            {loading ? (
              <div className="w-full h-full">
                {/* Image Skeleton */}
                <Skeleton className="w-full aspect-[3/2]" />
                
                <div className="px-6">
                  {/* Title Skeleton */}
                  <div className="sticky top-0 z-[51] py-6 bg-white/90 backdrop-blur-sm">
                    <Skeleton className="h-9 w-2/3" />
                  </div>
                  
                  {/* Description Skeleton */}
                  <div className="mt-8">
                    <Skeleton className="h-5 w-full mb-3" />
                    <Skeleton className="h-5 w-4/5" />
                  </div>
                  
                  {/* Details Skeleton */}
                  <div className="mt-8">
                    <Skeleton className="h-7 w-32 mb-3" />
                    <div className="bg-gray-50 rounded-2xl p-4">
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
                  
                  {/* Suggestions Skeleton */}
                  <div className="mt-8">
                    <Skeleton className="h-7 w-32 mb-3" />
                    <div className="bg-gray-50 rounded-2xl p-4 pl-10">
                      <Skeleton className="h-5 w-3/4 mb-5" />
                      <Skeleton className="h-5 w-2/3" />
                    </div>
                  </div>
                  
                  {/* Comments Skeleton */}
                  <div className="mt-8 mb-20">
                    <Skeleton className="h-7 w-32 mb-3" />
                    
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
                </div>
              </div>
            ) : (
              <>
                {/* Header image */}
                <div className="w-full aspect-[3/2] bg-gray-50 relative">
                  <Image 
                    src={issueData.imageUrl || "https://placehold.co/600x400/e6e6e6/a6a6a6?text=Issue+Image"} 
                    alt={issueData.name} 
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Main content */}
                <div className="px-6">
                  {/* Sticky title bar with close button */}
                  <div className="sticky top-0 z-[51] flex items-center justify-between py-6 bg-white/90 backdrop-blur-sm">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">{issueData.name}</h2>
                  </div>
                
                  {/* Description */}
                  <div className="mt-8">
                    <p className="text-lg text-gray-600 leading-relaxed">
                      {issueData.description}
                    </p>
                  </div>
                
                  {/* Details */}
                  <div className="mt-8">
                    <h3 className="text-xl font-medium text-gray-900 mb-3">Issue Details</h3>
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
                
                  {/* Suggestions */}
                  <div className="mt-8">
                    <h3 className="text-xl font-medium text-gray-900 mb-3">Suggestions</h3>
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
                
                  {/* Comments */}
                  <div className="mt-8 mb-20">
                    <h3 className="text-xl font-medium text-gray-900 mb-3">Comments</h3>
                    
                    {/* Comments list */}
                    <div className="space-y-5 mb-3">
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
                      className="w-full bg-[#97b9ff] text-white py-3 text-base font-semibold rounded-[1.875rem] border-none cursor-pointer flex items-center justify-center gap-2 hover:bg-[#7da7f8]"
                      onClick={() => setCommentSheetOpen(true)}
                    >
                      <MessageSquare size={18} />
                      Add Comment
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Comment Sheet Component */}
            <CommentSheet 
              open={commentSheetOpen}
              onOpenChange={setCommentSheetOpen}
              commentText={newCommentText}
              onCommentTextChange={handleCommentTextChange}
              onSubmit={handleCommentSubmit}
            />
        </div>
    );
  };

export default Issue;