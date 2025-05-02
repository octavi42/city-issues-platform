//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CSSProperties, useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';


// create a component
const Category = () => {

    const router = useRouter();
    // State and refs for image visibility
    const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [imageDataList, setImageDataList] = useState<any[]>([]); // State for client-side data

    // Dummy data for the component (keep static parts)
    const categoryData = {
        title: "Potholes",
        description: "Dangerous road conditions reported across the city",
        stats: {
        reported: 42,
        solved: 18,
        resolution: "5d"
        },
        severity: "high",
        slug: "potholes"
    };

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

    // Generate dynamic data only on the client
    useEffect(() => {
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
        setImageDataList(generatedData);
    }, []); // Empty dependency array ensures this runs only once on client mount


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
                                    router.push(`/issue/issue-${imageData.id.toString()}`);
                                }}
                            >
                                <img 
                                    src={imageData.imageUrl} 
                                    alt={imageData.issueText} 
                                    className="w-full h-auto object-cover" 
                                />
                                <div className="overlay p-3">
                                    <div className="title font-bold">
                                        {imageData.issueText || `${categoryData.slug} ${imageData.id}`}
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
                                    router.push(`/issue/issue-${imageData.id.toString()}`);
                                }}
                            >
                                <img 
                                    src={imageData.imageUrl} 
                                    alt={imageData.issueText} 
                                    className="w-full h-auto object-cover" 
                                />
                                <div className="overlay p-3">
                                    <div className="title font-bold">
                                        {imageData.issueText || `${categoryData.slug} ${imageData.id}`}
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
        <div className="h-full w-full bg-white text-black font-['Schibsted_Grotesk',Arial,sans-serif] p-6 pb-20">
            <div className="max-w-[28rem] mx-auto h-full overflow-y-auto">
                <div className="w-full h-10"></div>

                <div className="flex items-center mb-4 relative w-full">
                    <h1 className="text-4xl font-bold leading-tight capitalize text-black flex-1">{categoryData.title}</h1>
                </div>

                <div className="w-full h-10"></div>

                <p className="text-xl leading-tight text-[#787575] tracking-wider mb-6 w-full">{categoryData.description}</p>

                <div className="w-full h-4"></div>
                
                {/* Stats Container */}
                <div className="bg-[#F7F7F7] rounded-[1.875rem] p-6 mb-6 w-full">
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
                </div>

                <div className="w-full h-4"></div>
                
                {/* Severity Container */}
                <div className="bg-[#F7F7F7] rounded-[1.875rem] p-4 px-6 flex justify-between items-center mb-6 w-full">
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
                </div>

                <div className="w-full h-4"></div>

                {/* Images Grid */}
                {renderImageGrid()}
                
                <div className="w-full h-20"></div>
            </div>
        </div>
    );
};

//make this component available to the app
export default Category;
