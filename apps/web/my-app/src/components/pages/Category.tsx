//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CSSProperties, useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';


const pageStyles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "white",
      color: "black",
      fontFamily: "'Schibsted Grotesk', Arial, sans-serif",
      padding: "1.5rem",
      paddingBottom: "5rem",
      maxWidth: "28rem",
      margin: "0 auto"
    } as CSSProperties,
    headerContainer: {
      display: "flex",
      alignItems: "center",
      marginBottom: "1rem",
      position: "relative"
    } as CSSProperties,
    backButton: {
      width: "2.5rem",
      height: "2.5rem",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#F7F7F7",
      color: "#555",
      cursor: "pointer",
      marginRight: "1rem",
      border: "none",
      fontSize: "1.2rem",
      outline: "none",
      transition: "background-color 0.2s ease"
    } as CSSProperties,
    heading: {
      fontSize: "2.25rem", // 36px
      fontWeight: "700",
      lineHeight: "1.2",
      textTransform: "capitalize",
      color: "#000000",
      flex: 1
    } as CSSProperties,
    description: {
      fontSize: "1.25rem", // 20px
      lineHeight: "1.25",
      color: "#787575",
      letterSpacing: "0.04em",
      marginBottom: "1.5rem"
    } as CSSProperties,
    statsContainer: {
      backgroundColor: "#F7F7F7",
      borderRadius: "1.875rem", // 30px
      padding: "1.5rem",
      marginBottom: "1.5rem"
    } as CSSProperties,
    statsRow: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "1.5rem"
    } as CSSProperties,
    statItem: {
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      textAlign: "center",
      flex: 1
    } as CSSProperties,
    statValue: {
      fontSize: "2.25rem", // 36px
      fontWeight: "700",
      lineHeight: "1.2",
      color: "#000000",
      marginBottom: "0.25rem"
    } as CSSProperties,
    statLabel: {
      fontSize: "0.9375rem", // 15px
      lineHeight: "1.25",
      color: "#000000",
      textAlign: "center",
      maxWidth: "5rem"
    } as CSSProperties,
    severityContainer: {
      backgroundColor: "#F7F7F7",
      borderRadius: "1.875rem", // 30px
      padding: "1rem 1.5rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1.5rem"
    } as CSSProperties,
    highSeverity: {
      backgroundColor: "#FE7A71",
      color: "#F7F7F7",
      borderRadius: "1.875rem", // 30px
      padding: "0.5rem 1rem",
      fontSize: "0.9375rem", // 15px
      fontWeight: "400",
      width: "5rem",
      textAlign: "center"
    } as CSSProperties,
    mediumSeverity: {
      color: "#728019",
      fontSize: "0.9375rem", // 15px
      fontWeight: "400",
      padding: "0.5rem 0",
      width: "5rem",
      textAlign: "center"
    } as CSSProperties,
    lowSeverity: {
      color: "#075CDD",
      fontSize: "0.9375rem", // 15px
      fontWeight: "400",
      padding: "0.5rem 0",
      width: "5rem",
      textAlign: "center"
    } as CSSProperties,
    imagesGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "1rem",
      marginTop: "2rem"
    } as CSSProperties,
    imageItem: (aspectRatio: string) => ({
      borderRadius: "1.875rem", // 30px
      overflow: "hidden",
      aspectRatio: aspectRatio,
      backgroundColor: "#F7F7F7",
      marginBottom: "1rem",
      opacity: 0, // Start hidden
      transform: 'translateY(20px)', // Start shifted down
      willChange: 'opacity, transform' // Hint for performance
    } as CSSProperties),
    placeholderImage: {
      width: "100%",
      height: "150px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#666",
      fontSize: "0.875rem",
      fontWeight: "500",
      backgroundColor: "#f0f0f0",
      borderRadius: "1rem",
      cursor: "pointer",
      transition: "transform 0.2s, background-color 0.2s",
      "&:hover": {
        transform: "scale(1.02)",
        backgroundColor: "#e5e5e5"
      }
    } as CSSProperties
  };

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
            // Optionally render placeholders or nothing while loading
            return null; // Or some loading indicator
        }

        return (
        <div style={{ columnCount: 2, columnGap: "1rem" }}>
            {imageDataList.map((imageData, index) => {
                return (
                    <div
                    key={imageData.id}
                    ref={el => {
                        if (imageRefs.current) {
                        imageRefs.current[index] = el;
                        }
                    }}
                    style={{ marginBottom: "1rem" }}
                    >
                        <div className={`imageItem image-${imageData.id}`} onClick={() => {
                        router.push(`/issue/issue-${imageData.id.toString()}`);
                        }}>
                        <img src={imageData.imageUrl} alt={imageData.issueText} />
                        <div className="overlay">
                            <div className="title">
                            {imageData.issueText || `${categoryData.slug} ${imageData.id}`}
                            </div>
                            <div className="meta">
                            {imageData.daysAgo}d ago · {imageData.reportsCount} reports
                            </div>
                        </div>
                        </div>
                    </div>
                );
            })}
        </div>
        );
    };

    return (
        <div style={{
                ...pageStyles.container,
                maxHeight: '100%',
                overflowY: 'auto',
            }}>
            <div style={pageStyles.headerContainer}>
                <h1 style={pageStyles.heading}>{categoryData.title}</h1>
            </div>
            <p style={pageStyles.description}>{categoryData.description}</p>
            {/* Stats Container */}
            <div style={pageStyles.statsContainer}>
                <div style={pageStyles.statsRow}>
                <div style={pageStyles.statItem}>
                    <div style={pageStyles.statValue}>{categoryData.stats.reported}</div>
                    <div style={pageStyles.statLabel}>reported issues</div>
                </div>
                <div style={pageStyles.statItem}>
                    <div style={pageStyles.statValue}>{categoryData.stats.solved}</div>
                    <div style={pageStyles.statLabel}>solved issues</div>
                </div>
                <div style={pageStyles.statItem}>
                    <div style={pageStyles.statValue}>{categoryData.stats.resolution}</div>
                    <div style={pageStyles.statLabel}>resolution time</div>
                </div>
                </div>
            </div>
            {/* Severity Container */}
            <div style={pageStyles.severityContainer}>
                <div style={categoryData.severity === "high" ? pageStyles.highSeverity : { ...pageStyles.mediumSeverity, opacity: categoryData.severity === "medium" ? 1 : 0.5 }}>High</div>
                <div style={categoryData.severity === "medium" ? pageStyles.mediumSeverity : { ...pageStyles.mediumSeverity, opacity: categoryData.severity === "medium" ? 1 : 0.5 }}>Medium</div>
                <div style={categoryData.severity === "low" ? pageStyles.lowSeverity : { ...pageStyles.lowSeverity, opacity: categoryData.severity === "low" ? 1 : 0.5 }}>Low</div>
            </div>

            {/* Images Grid */}
            {renderImageGrid()}
          </div>
    );
};

//make this component available to the app
export default Category;
