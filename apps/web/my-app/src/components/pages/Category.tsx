//import liraries
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { fetchCategories, fetchDetectionEventsByCategory, fetchPhotosWithDetectionEvents } from '@/lib/neo4j-queries';
import { Category as CategoryType, DetectionEvent } from '@/lib/neo4j-schema';
import { Skeleton } from "@/components/ui/skeleton";
import SheetOrBackButton from "./SheetOrBackButton";
import { ArrowLeft } from "lucide-react";

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

// create a component
const Category = ({ isIntercepted = false }: { isIntercepted: boolean }) => {
    const router = useRouter();
    const params = useParams();
    const slug = params?.slug as string;
    
    // State and refs for image visibility
    const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [imageDataList, setImageDataList] = useState<ImageData[]>([]);
    const [detectionEvents, setDetectionEvents] = useState<DetectionEvent[]>([]);
    const [photosWithEvents, setPhotosWithEvents] = useState<{photo: PhotoData; event: DetectionEvent}[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [categoryData, setCategoryData] = useState({
        title: "",
        description: "",
        stats: {
            reported: 0,
            solved: 0,
            resolution: "0d"
        },
        severity: "medium",
        slug: ""
    });
    
    // Fetch category data from Neo4j based on slug
    useEffect(() => {
        const fetchCategoryData = async () => {
            try {
                setIsLoading(true);
                console.log("Fetching category data for slug:", slug);
                if (!slug) return;
                
                // Fetch all categories (since we don't have a direct fetchCategoryBySlug function)
                const categories = await fetchCategories();

                console.log("Categories:", categories);
                
                // Find category by matching slug with name (converted to lowercase and hyphenated)
                const category = categories.find((cat: CategoryType) => {
                    // Convert category name to slug format (lowercase, hyphenated)
                    const catSlug = cat.name?.toLowerCase().replace(/\s+/g, '-') || '';
                    return catSlug === slug;
                });
                
                if (category) {
                    setCategoryData({
                        title: category.name || "",
                        description: category.description || "",
                        stats: {
                            reported: 42, // Placeholder stats (would come from real data in production)
                            solved: 18,
                            resolution: "5d"
                        },
                        severity: "high", // This could be derived from actual data
                        slug: slug
                    });
                }
            } catch (error) {
                console.error("Error fetching category data:", error);
                // Don't set loading to false on error - keep showing skeletons
            }
        };
        
        fetchCategoryData();
    }, [slug]);

    // Fetch photos with detection events for the category
    useEffect(() => {
        const fetchPhotosAndEvents = async () => {
            try {
                setIsLoading(true);
                if (!slug) return;
                
                const photosAndEvents = await fetchPhotosWithDetectionEvents(slug);
                console.log("Photos with detection events for category:", photosAndEvents);
                
                // Transform the data to ensure url is never undefined
                const transformedData = photosAndEvents.map(item => ({
                    photo: {
                        ...item.photo,
                        url: item.photo.url || `/images/${slug}.jpg` // Provide a default URL if undefined
                    },
                    event: item.event
                }));
                
                setPhotosWithEvents(transformedData);
                
                // Also fetch standalone detection events as a fallback
                const events = await fetchDetectionEventsByCategory(slug);
                console.log("Detection events for category:", events);
                setDetectionEvents(events);
            } catch (error) {
                console.error("Error fetching photos and detection events:", error);
            }
        };
        
        fetchPhotosAndEvents();
    }, [slug]);

    // Fallback mock data generator - wrapped in useCallback to prevent infinite loops
    const generateMockData = useCallback(() => {
        const baseIssueContent = [
            "Large pothole on Main Street",
            "Dangerous crater on 5th Avenue",
            "Multiple potholes near school zone",
            "Deep pothole causing accidents",
            "Road damage after recent storm",
            "Pothole needs urgent repair",
            "Growing pothole on busy intersection",
            "Multiple tire damages reported"
        ];

        const baseImageUrls = [
            "/images/pothole1.jpg",
            "/images/pothole2.jpg",
            "/images/pothole3.jpg",
            "/images/pothole4.jpg",
            "/images/pothole5.jpg",
            "/images/pothole6.jpg",
            "/images/pothole7.jpg",
            "/images/pothole8.jpg"
        ];

        const issues = baseIssueContent.length > 0 ? baseIssueContent : [];
        const images = baseImageUrls.length > 0 ? baseImageUrls : Array(8).fill(categoryData.slug ? `/images/${categoryData.slug}.jpg` : '');

        const generatedData = issues.map((issueText, index) => {
            const item = index + 1;
            return {
                id: item,
                imageUrl: images[index],
                issueText: issueText,
                name: issueText || `${categoryData.slug} image ${item}`,
                handle: `image_${item}`,
                followers: Math.floor(Math.random() * 1000),
                following: Math.floor(Math.random() * 500),
                posts: Math.floor(Math.random() * 100),
                bio: `This is ${categoryData.slug} image ${item} description`,
                daysAgo: Math.floor(Math.random() * 10) + 1,
                reportsCount: Math.floor(Math.random() * 15) + 1,
                content: [
                    {
                        username: `${categoryData.slug} image ${item}`,
                        handle: `image_${item}`,
                        hoursPast: Math.floor(Math.random() * 24),
                        content: [`Details about ${categoryData.slug} image ${item}`],
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
    }, [categoryData.slug, setImageDataList, setIsLoading]);

    // Generate image data from photos and detection events
    useEffect(() => {
        // Add a small offset time after data is loaded
        const finishLoading = (data: ImageData[]) => {
            setImageDataList(data);
            // Small delay to ensure data is fully processed before showing
            setTimeout(() => {
                setIsLoading(false);
            }, 300);
        };

        // Remove artificial delay and ensure loading state is correctly managed
        if (photosWithEvents.length > 0) {
            // Map photos with detection events to image data format
            const generatedData = photosWithEvents.map((item, index) => {
                const { photo, event } = item;
                
                return {
                    id: index + 1,
                    imageUrl: photo.url || `/images/${categoryData.slug}${index + 1}.jpg`, // Use photo URL or fallback
                    issueText: event.name || `${categoryData.title} issue ${index + 1}`,
                    name: event.name || `${categoryData.title} image ${index + 1}`,
                    handle: `event_${event.event_id}`,
                    followers: Math.floor(Math.random() * 1000),
                    following: Math.floor(Math.random() * 500),
                    posts: Math.floor(Math.random() * 100),
                    bio: event.description || `This is ${categoryData.title} detection event description`,
                    daysAgo: Math.floor(Math.random() * 10) + 1, // Could be calculated from reported_at
                    reportsCount: Math.floor(Math.random() * 15) + 1,
                    severity: event.severity || 'medium',
                    eventId: event.event_id,
                    content: [
                        {
                            username: event.name || `${categoryData.title} image ${index + 1}`,
                            handle: `event_${event.event_id}`,
                            hoursPast: Math.floor(Math.random() * 24),
                            content: [event.description || `Details about ${categoryData.title} detection event`],
                            commentsCount: Math.floor(Math.random() * 50),
                            sharesCount: Math.floor(Math.random() * 30),
                            likesCount: Math.floor(Math.random() * 100)
                        }
                    ]
                };
            });
            finishLoading(generatedData);
        } else if (detectionEvents.length > 0) {
            // Fallback to detection events if no photos are available
            // Map detection events to image data format
            const generatedData = detectionEvents.map((event, index) => {
                const imageUrl = `/images/${categoryData.slug}${index + 1}.jpg`; // Fallback image
                
                return {
                    id: index + 1,
                    imageUrl: imageUrl,
                    issueText: event.name || `${categoryData.title} issue ${index + 1}`,
                    name: event.name || `${categoryData.title} image ${index + 1}`,
                    handle: `event_${event.event_id}`,
                    followers: Math.floor(Math.random() * 1000),
                    following: Math.floor(Math.random() * 500),
                    posts: Math.floor(Math.random() * 100),
                    bio: event.description || `This is ${categoryData.title} detection event description`,
                    daysAgo: Math.floor(Math.random() * 10) + 1, // Could be calculated from reported_at
                    reportsCount: Math.floor(Math.random() * 15) + 1,
                    severity: event.severity || 'medium',
                    eventId: event.event_id,
                    content: [
                        {
                            username: event.name || `${categoryData.title} image ${index + 1}`,
                            handle: `event_${event.event_id}`,
                            hoursPast: Math.floor(Math.random() * 24),
                            content: [event.description || `Details about ${categoryData.title} detection event`],
                            commentsCount: Math.floor(Math.random() * 50),
                            sharesCount: Math.floor(Math.random() * 30),
                            likesCount: Math.floor(Math.random() * 100)
                        }
                    ]
                };
            });
            finishLoading(generatedData);
        } else if (categoryData.title) {
            // Only generate mock data when we have a category title
            // Fallback to mock data if no events
            generateMockData();
        }
        
        // Cleanup any lingering timeouts when component unmounts
        return () => {
            clearTimeout(finishLoading as unknown as number);
        };
    }, [photosWithEvents, detectionEvents, categoryData.title, categoryData.slug, generateMockData]);

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

        // Split the data into two arrays for two columns
        const leftColumnData = imageDataList.filter((_, i) => i % 2 === 0);
        const rightColumnData = imageDataList.filter((_, i) => i % 2 === 1);

        return (
            <div className="grid grid-cols-2 gap-4 mt-8 w-full">
                {/* Left Column */}
                <div className="flex flex-col gap-4 w-full">
                    {leftColumnData.map((imageData) => (
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
                                    const issueId = imageData.eventId || `issue-${imageData.id.toString()}`;
                                    router.push(`/issue/${issueId}`);
                                }}
                            >
                                <div className="relative w-full h-40">
                                    <Image 
                                        src={imageData.imageUrl} 
                                        alt={imageData.issueText} 
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                                <div className="overlay p-3">
                                    <div className="title font-bold">
                                        {imageData.issueText}
                                    </div>
                                    <div className="meta text-sm text-gray-600">
                                        {imageData.daysAgo}d ago · {imageData.reportsCount} reports
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-4 w-full">
                    {rightColumnData.map((imageData) => (
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
                                    const issueId = imageData.eventId || `issue-${imageData.id.toString()}`;
                                    router.push(`/issue/${issueId}`);
                                }}
                            >
                                <div className="relative w-full h-40">
                                    <Image 
                                        src={imageData.imageUrl} 
                                        alt={imageData.issueText} 
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                                <div className="overlay p-3">
                                    <div className="title font-bold">
                                        {imageData.issueText}
                                    </div>
                                    <div className="meta text-sm text-gray-600">
                                        {imageData.daysAgo}d ago · {imageData.reportsCount} reports
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="h-full w-full bg-white text-black font-['Schibsted_Grotesk',Arial,sans-serif] p-6 pb-20 overflow-hidden">
            <div className="max-w-[28rem] mx-auto h-full overflow-y-auto">
                <div className="w-full h-10"></div>

                <div className="flex items-center mb-4 w-full gap-2">
                    <SheetOrBackButton
                        isIntercepted={isIntercepted}
                        className="rounded-full p-2 focus:none"
                        icon={<ArrowLeft className="w-5 h-5" />}
                    />
                    {isLoading ? (
                        <Skeleton className="h-8 w-2/3 bg-gray-200" />
                    ) : (
                        <h1 className="text-4xl font-bold leading-tight capitalize text-black flex-1">{categoryData.title}</h1>
                    )}
                </div>

                <div className="w-full h-10"></div>

                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full bg-gray-200" />
                        <Skeleton className="h-4 w-3/4 bg-gray-200" />
                    </div>
                ) : (
                    <p className="text-xl leading-tight text-[#787575] tracking-wider mb-6 w-full">{categoryData.description}</p>
                )}

                <div className="w-full h-4"></div>
                
                {/* Stats Container */}
                <div className="bg-[#F7F7F7] rounded-[1.875rem] p-6 mb-6 w-full">
                    {isLoading ? (
                        <div className="flex justify-between">
                            {/* Simple placeholders for stats */}
                            <Skeleton className="h-10 w-20 bg-gray-200" />
                            <Skeleton className="h-10 w-20 bg-gray-200" />
                            <Skeleton className="h-10 w-20 bg-gray-200" />
                        </div>
                    ) : (
                        <div className="flex justify-between mb-6">
                            <div className="flex flex-col items-center text-center flex-1">
                                <div className="text-4xl font-bold leading-tight text-black mb-1">{categoryData.stats.reported}</div>
                                <div className="text-[0.9375rem] leading-tight text-black text-center max-w-[5rem]">reported issues</div>
                            </div>
                            <div className="flex flex-col items-center text-center flex-1">
                                <div className="text-4xl font-bold leading-tight text-black mb-1">{categoryData.stats.solved}</div>
                                <div className="text-[0.9375rem] leading-tight text-black text-center max-w-[5rem]">solved issues</div>
                            </div>
                            <div className="flex flex-col items-center text-center flex-1">
                                <div className="text-4xl font-bold leading-tight text-black mb-1">{categoryData.stats.resolution}</div>
                                <div className="text-[0.9375rem] leading-tight text-black text-center max-w-[5rem]">resolution time</div>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Severity Container */}
                {/* <div className="bg-[#F7F7F7] rounded-[1.875rem] p-4 px-6 flex justify-between items-center mb-6 w-full">
                    {isLoading ? (
                        <Skeleton className="h-8 w-full bg-gray-200" />
                    ) : (
                        <>
                            <div className={`${categoryData.severity === "high" ? 'bg-[#FE7A71] text-[#F7F7F7]' : ''} 
                                rounded-[1.875rem] py-2 px-4 text-[0.9375rem] font-normal w-20 text-center
                                ${categoryData.severity !== "high" ? 'text-[#075CDD] opacity-50' : ''}`}>
                                High
                            </div>
                            <div className={`text-[#728019] text-[0.9375rem] font-normal py-2 w-20 text-center 
                                ${categoryData.severity === "medium" ? '' : 'opacity-50'}`}>
                                Medium
                            </div>
                            <div className={`text-[#075CDD] text-[0.9375rem] font-normal py-2 w-20 text-center 
                                ${categoryData.severity === "low" ? '' : 'opacity-50'}`}>
                                Low
                            </div>
                        </>
                    )}
                </div> */}

                {/* Images Grid with skeleton loading state */}
                {isLoading ? renderSkeletonGrid() : renderImageGrid()}
                
                <div className="w-full h-20"></div>
            </div>
        </div>
    );
};

//make this component available to the app
export default Category;
