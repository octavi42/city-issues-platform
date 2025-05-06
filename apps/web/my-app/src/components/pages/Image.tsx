//import liraries
import React, { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import NextImage from 'next/image';
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet } from "@silk-hq/components";
import CommentSheet from "@/components/sheets/CommentSheet";

import { fetchPhotoByEventId } from '@/lib/neo4j-queries';
import { runQuery } from '@/lib/neo4j';
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";

interface PhotoData {
    photo_id: string;
    url?: string;
    taken_at?: string;
    [key: string]: unknown;
}

// create a component
const Image = () => {
    const params = useParams();
    const [imageData, setImageData] = useState<{ url: string; eventText: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [likeCount, setLikeCount] = useState(0);
    const [dislikeCount, setDislikeCount] = useState(0);
    const [userInteraction, setUserInteraction] = useState<'like' | 'dislike' | null>(null);
    
    // Comment-related state
    const [commentSheetOpen, setCommentSheetOpen] = useState(false);
    const [newCommentText, setNewCommentText] = useState('');
    
    // Get the ID from the URL params
    const urlId = typeof params.slug === 'string' ? params.slug : '';
    
    // Fetch image data on mount
    useEffect(() => {
        async function fetchImageData() {
        if (!urlId) {
            setLoading(false);
            return;
        }

        try {
            // First try to get photo directly by photo_id
            const photoQuery = `
            MATCH (p:Photo)
            WHERE p.photo_id = $photoId
            RETURN properties(p) AS photo
            `;
            
            const photoResults = await runQuery<{ photo: PhotoData }>(photoQuery, { photoId: urlId });
            
            // If no direct photo match, try to get it via the event relationship
            if (!photoResults.length) {
            const photoData = await fetchPhotoByEventId(urlId);
            if (photoData) {
                setImageData({
                url: photoData.url || '/images/image.png',
                eventText: 'Image from event'
                });
                console.log('Fetched photo by event ID:', photoData);
            }
            } else {
            // Direct photo match found
            const photoData = photoResults[0].photo;
            setImageData({
                url: photoData.url || '/images/image.png',
                eventText: 'Image'
            });
            console.log('Fetched photo directly:', photoData);
            }
        } catch (error) {
            console.error('Error fetching image:', error);
        } finally {
            setLoading(false);
        }
        }
        
        fetchImageData();
    }, [urlId]);
    
    

    const handleLike = () => {
        if (userInteraction === 'like') {
        setLikeCount(prev => prev - 1);
        setUserInteraction(null);
        } else {
        if (userInteraction === 'dislike') {
            setDislikeCount(prev => prev - 1);
        }
        setLikeCount(prev => prev + 1);
        setUserInteraction('like');
        }
    };

    const handleDislike = () => {
        if (userInteraction === 'dislike') {
        setDislikeCount(prev => prev - 1);
        setUserInteraction(null);
        } else {
        if (userInteraction === 'like') {
            setLikeCount(prev => prev - 1);
        }
        setDislikeCount(prev => prev + 1);
        setUserInteraction('dislike');
        }
    };

    const handleCommentTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewCommentText(e.target.value);
    };
    
    const handleCommentSubmit = () => {
        // Here you would typically send the comment to your backend
        console.log('Comment submitted:', newCommentText);
        // Clear the comment text after submission
        setNewCommentText('');
    };

    return (
                    <div className="h-full w-full overflow-hidden">
                    <Sheet.Trigger
                      className="p-4 rounded-full text-white"
                      action="dismiss"
                      style={{
                        position: 'fixed',
                        top: '50px',
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
                    
                    {/* Comment button - added to top left */}
                    <div
                      onClick={() => setCommentSheetOpen(true)}
                      className="fixed top-[50px] w-[70px] h-[70px] left-[20px] z-[10000] flex items-center justify-center p-3 rounded-full bg-transparent text-white"
                    >
                      <MessageSquare size={24} />
                    </div>
                    
                    <div className="w-full h-full flex flex-col">
                      <div className="flex-grow relative">
                        {loading ? (
                          <div className="flex items-center justify-center w-full h-full relative">
                            <Skeleton className="absolute inset-0" />
                          </div>
                        ) : imageData ? (
                          <NextImage 
                            src={imageData.url}
                            alt={imageData.eventText}
                            fill
                            style={{ objectFit: 'cover' }}
                            quality={100}
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full">
                            <p className="text-lg text-gray-600">Image not found</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="fixed bottom-0 left-0 right-0 flex justify-center items-center p-4 w-full text-white" style={{ bottom: '50px' }}>
                        <button 
                          onClick={handleLike}
                          className={`flex items-center mx-4 px-4 py-2 rounded-full ${userInteraction === 'like' ? 'text-blue-500' : 'text-white'}`}
                        >
                          <ThumbsUp className="mr-2" size={20} />
                          <span>{likeCount}</span>
                        </button>
                        <button 
                          onClick={handleDislike}
                          className={`flex items-center mx-4 px-4 py-2 rounded-full ${userInteraction === 'dislike' ? 'text-red-500' : 'text-white'}`}
                        >
                          <ThumbsDown className="mr-2" size={20} />
                          <span>{dislikeCount}</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Comment Sheet */}
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

//make this component available to the app
export default Image;
