//import liraries
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { runQuery } from '@/lib/neo4j';
import { DetectionEvent } from '@/lib/neo4j-schema';
import { Skeleton } from "@/components/ui/skeleton";

// Define interfaces for image data
interface ContentItem {
    username: string;
    handle: string;
    hoursPast: number;
    content: string[];
    commentsCount: number;
    sharesCount: number;
    likesCount: number;
}

interface PhotoData {
    url: string;
    photo_id?: string;
    location?: string;
    captured_at?: string;
    [key: string]: unknown;
}

interface ImageData {
    id: number;
    imageUrl: string;
    issueText: string;
    name: string;
    handle: string;
    followers: number;
    following: number;
    posts: number;
    bio: string;
    daysAgo: number;
    reportsCount: number;
    severity?: string;
    eventId?: string;
    content: ContentItem[];
}

interface MaintainedItem {
    item_id: string;
    name?: string;
    description?: string;
    condition?: string;
    last_maintained?: string;
    [key: string]: unknown;
}

// create a component
const Maintained = () => {
    const router = useRouter();
    const params = useParams();
    const slug = params?.slug as string;
    
    // State and refs for image visibility
    const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [imageDataList, setImageDataList] = useState<ImageData[]>([]);
    const [photosWithMaintained, setPhotosWithMaintained] = useState<{photo: PhotoData; maintained: MaintainedItem}[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Fetch all photos connected to maintenance nodes
    useEffect(() => {
        const fetchMaintainedPhotos = async () => {
            try {
                setIsLoading(true);
                console.log("Fetching photos connected to maintenance nodes");
                
                // Direct Neo4j Cypher query to find photos connected to Maintained nodes
                const cypher = `
                    MATCH (m:Maintenance)<-[:CONTAINS]-(p:Photo)
                    RETURN properties(p) AS photo, properties(m) AS maintained
                `;
                
                const results = await runQuery<{photo: PhotoData; maintained: MaintainedItem}>(cypher);
                console.log("Maintenance photos fetched:", results);
                
                if (results && results.length > 0) {
                    // Transform the data to ensure url is never undefined
                    const transformedData = results.map(item => ({
                        photo: {
                            ...item.photo,
                            url: item.photo.url || `/images/maintained.jpg` // Provide a default URL if undefined
                        },
                        maintained: item.maintained
                    }));
                    
                    setPhotosWithMaintained(transformedData);
                    
                    // Generate image data from the fetched photos
                    generateImageData(transformedData);
                } else {
                    console.log("No maintenance photos found, using mock data");
                    generateMockData();
                }
            } catch (error) {
                console.error("Error fetching maintenance photos:", error);
                // Fallback to mock data
                generateMockData();
            }
        };
        
        fetchMaintainedPhotos();
    }, []);

    // Fallback mock data generator - wrapped in useCallback to prevent infinite loops
    const generateMockData = useCallback(() => {
        console.log("Generating mock maintenance data");
        const baseIssueContent = [
            "Well maintained sidewalk",
            "Recently repaired pavement",
            "Clean park area",
            "Updated public facilities",
            "Well-kept street",
            "Properly maintained bench",
            "Nicely preserved historical element",
            "Well organized public space"
        ];

        const baseImageUrls = [
            "/images/maintained1.jpg",
            "/images/maintained2.jpg",
            "/images/maintained3.jpg",
            "/images/maintained4.jpg",
            "/images/maintained5.jpg",
            "/images/maintained6.jpg",
            "/images/maintained7.jpg",
            "/images/maintained8.jpg"
        ];

        const issues = baseIssueContent.length > 0 ? baseIssueContent : [];
        const images = baseImageUrls.length > 0 ? baseImageUrls : Array(8).fill(`/images/maintained.jpg`);

        const generatedData = issues.map((issueText, index) => {
            const item = index + 1;
            return {
                id: item,
                imageUrl: images[index],
                issueText: issueText,
                name: issueText || `Maintained element ${item}`,
                handle: `image_${item}`,
                followers: Math.floor(Math.random() * 1000),
                following: Math.floor(Math.random() * 500),
                posts: Math.floor(Math.random() * 100),
                bio: `This is maintenance example ${item}`,
                daysAgo: Math.floor(Math.random() * 10) + 1,
                reportsCount: Math.floor(Math.random() * 15) + 1,
                content: [
                    {
                        username: `User ${item}`,
                        handle: `user_${item}`,
                        hoursPast: Math.floor(Math.random() * 24),
                        content: [`Details about maintained element ${item}`],
                        commentsCount: Math.floor(Math.random() * 50),
                        sharesCount: Math.floor(Math.random() * 30),
                        likesCount: Math.floor(Math.random() * 100)
                    }
                ]
            };
        });
        
        // Only set loading to false if we actually have data
        if (generatedData.length > 0) {
            setImageDataList(generatedData);
            // Small delay to ensure data is fully processed before showing
            setTimeout(() => {
                setIsLoading(false);
            }, 300);
        }
    }, [setImageDataList, setIsLoading]);

    // Generate image data from photos and maintained items
    const generateImageData = (data: {photo: PhotoData; maintained: MaintainedItem}[]) => {
        console.log("Generating image data from", data.length, "maintenance photos");
        // Map photos with maintained items to image data format
        const generatedData = data.map((item, index) => {
            const { photo, maintained } = item;
            
            // Calculate days ago from last_maintained date if available
            let daysAgo = Math.floor(Math.random() * 10) + 1;
            if (maintained.last_maintained) {
                try {
                    const lastMaintained = new Date(maintained.last_maintained);
                    const now = new Date();
                    const diffTime = Math.abs(now.getTime() - lastMaintained.getTime());
                    daysAgo = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                } catch (e) {
                    console.error("Error calculating days ago:", e);
                }
            }
            
            return {
                id: index + 1,
                imageUrl: photo.url || `/images/maintained${index + 1}.jpg`, // Use photo URL or fallback
                issueText: maintained.name || `Well maintained element ${index + 1}`,
                name: maintained.name || `Maintained element ${index + 1}`,
                handle: `maintained_${maintained.item_id}`,
                followers: Math.floor(Math.random() * 1000),
                following: Math.floor(Math.random() * 500),
                posts: Math.floor(Math.random() * 100),
                bio: maintained.description || `This is a well maintained element in the city`,
                daysAgo: daysAgo,
                reportsCount: Math.floor(Math.random() * 15) + 1,
                severity: maintained.condition || 'good',
                eventId: maintained.item_id,
                content: [
                    {
                        username: maintained.name || `User ${index + 1}`,
                        handle: `maintained_${maintained.item_id}`,
                        hoursPast: Math.floor(Math.random() * 24),
                        content: [maintained.description || `Details about this well maintained element`],
                        commentsCount: Math.floor(Math.random() * 50),
                        sharesCount: Math.floor(Math.random() * 30),
                        likesCount: Math.floor(Math.random() * 100)
                    }
                ]
            };
        });
        
        setImageDataList(generatedData);
        // Small delay to ensure data is fully processed before showing
        setTimeout(() => {
            setIsLoading(false);
        }, 300);
    };

    // Skeleton loader for the image grid
    const renderSkeletonGrid = () => {
        return (
            <div className="grid grid-cols-2 gap-4 mt-8 w-full">
                {/* Left Column - Just 3 simple blocks */}
                <div className="flex flex-col gap-4 w-full">
                    {[1, 2, 3].map((index) => (
                        <Skeleton 
                            key={`skeleton-left-${index}`} 
                            className="w-full h-40 rounded-[1.875rem] bg-gray-200" 
                        />
                    ))}
                </div>

                {/* Right Column - Just 3 simple blocks with offset for visual variety */}
                <div className="flex flex-col gap-4 w-full">
                    <div className="h-6"></div>
                    {[1, 2, 3].map((index) => (
                        <Skeleton 
                            key={`skeleton-right-${index}`} 
                            className="w-full h-40 rounded-[1.875rem] bg-gray-200" 
                        />
                    ))}
                </div>
            </div>
        );
    };

    // renderImageGrid function using client-side state
    const renderImageGrid = () => {
        if (imageDataList.length === 0) {
            return null; // Or some loading indicator
        }

        // Array of different height classes for variety
        const heightClasses = ['h-36', 'h-40', 'h-48', 'h-56', 'h-64'];
        
        // Function to get a height class based on image index
        const getHeightClass = (index: number) => {
            // Use modulo to cycle through heights or use a pattern
            // For more randomness, use: heightClasses[Math.floor(Math.random() * heightClasses.length)]
            return heightClasses[index % heightClasses.length];
        };

        // Split the data into two arrays for two columns
        const leftColumnData = imageDataList.filter((_, i) => i % 2 === 0);
        const rightColumnData = imageDataList.filter((_, i) => i % 2 === 1);

        return (
            <div className="grid grid-cols-2 gap-4 mt-8 w-full">
                {/* Left Column */}
                <div className="flex flex-col gap-4 w-full">
                    {leftColumnData.map((imageData, columnIndex) => {
                        const imageHeight = getHeightClass(columnIndex);
                        return (
                            <div
                                key={imageData.id}
                                ref={el => {
                                    if (imageRefs.current) {
                                        imageRefs.current[imageData.id - 1] = el;
                                    }
                                }}
                                className="w-full"
                            >
                                <div 
                                    className="cursor-pointer rounded-[1.875rem] overflow-hidden bg-[#F7F7F7] w-full"
                                    onClick={() => {
                                        // Use eventId if available, otherwise use generated id
                                        const issueId = imageData.eventId || `maintenance-${imageData.id.toString()}`;
                                    }}
                                >
                                    <div className={`relative w-full ${imageHeight}`}>
                                        <Image 
                                            src={imageData.imageUrl} 
                                            alt={imageData.issueText} 
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-4 w-full">
                    {rightColumnData.map((imageData, columnIndex) => {
                        // Use a different starting point in the height cycle for the right column
                        const imageHeight = getHeightClass(columnIndex + 2); // offset by 2 to create variation
                        return (
                            <div
                                key={imageData.id}
                                ref={el => {
                                    if (imageRefs.current) {
                                        imageRefs.current[imageData.id - 1] = el;
                                    }
                                }}
                                className="w-full"
                            >
                                <div 
                                    className="cursor-pointer rounded-[1.875rem] overflow-hidden bg-[#F7F7F7] w-full"
                                    onClick={() => {
                                        // Use eventId if available, otherwise use generated id
                                        const issueId = imageData.eventId || `maintenance-${imageData.id.toString()}`;
                                    }}
                                >
                                    <div className={`relative w-full ${imageHeight}`}>
                                        <Image 
                                            src={imageData.imageUrl} 
                                            alt={imageData.issueText} 
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="h-full w-full bg-white text-black font-['Schibsted_Grotesk',Arial,sans-serif] p-6 pb-20">
            <div className="max-w-[28rem] mx-auto h-full overflow-y-auto">
                <div className="w-full h-10"></div>

                <div className="flex items-center mb-4 relative w-full">
                    {isLoading ? (
                        <Skeleton className="h-8 w-2/3 bg-gray-200" />
                    ) : (
                        <h1 className="text-4xl font-bold leading-tight capitalize text-black flex-1">Well maintained element from city</h1>
                    )}
                </div>

                <div className="w-full h-10"></div>

                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full bg-gray-200" />
                        <Skeleton className="h-4 w-3/4 bg-gray-200" />
                    </div>
                ) : (
                    <p className="text-xl leading-tight text-[#787575] tracking-wider mb-6 w-full">
                        Users from around the city upload these images. We recommend you vote on the relevance of every image when opening them to make the system as efficient as possible.
                    </p>
                )}

                <div className="w-full h-4"></div>
                
                {/* Images Grid with skeleton loading state */}
                {isLoading ? renderSkeletonGrid() : renderImageGrid()}
                
                <div className="w-full h-20"></div>
            </div>
        </div>
    );
};

//make this component available to the app
export default Maintained;