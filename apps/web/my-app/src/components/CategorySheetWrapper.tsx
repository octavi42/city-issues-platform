"use client";

import { useRouter } from 'next/navigation';
import React, { CSSProperties, useState, useEffect, useRef } from "react";
import '../components/examples/Page/ExamplePage.css';
import '../components/examples/Page/Page.css';

import { Sheet } from "@silk-hq/components";
import { ExampleSheetWithStacking } from '@/components/examples/SheetWithStacking/ExampleSheetWithStacking';

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

export default function CategorySheetWrapper() {
  const router = useRouter();
  const [presented, setPresented] = useState(false);

  // State and refs for image visibility
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);


  // Auto-present sheet on mount
  useEffect(() => {
    const timer = setTimeout(() => setPresented(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Handle closing: set state and navigate back
  function handlePresentedChange(isPresented: boolean) {
    setPresented(isPresented);
    if (!isPresented) {
      // Delay navigation to allow closing animation
      setTimeout(() => {
        router.back();
      }, 300); 
    }
  }
  
  // Dummy data for the component
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

  const issueContent = [
    "Large pothole on Main Street",
    "Dangerous crater on 5th Avenue",
    "Multiple potholes near school zone",
    "Deep pothole causing accidents",
    "Road damage after recent storm",
    "Pothole needs urgent repair",
    "Growing pothole on busy intersection",
    "Multiple tire damages reported"
  ];

  const imageUrls = [
    "/images/pothole1.jpg",
    "/images/pothole2.jpg",
    "/images/pothole3.jpg",
    "/images/pothole4.jpg",
    "/images/pothole5.jpg",
    "/images/pothole6.jpg",
    "/images/pothole7.jpg",
    "/images/pothole8.jpg"
  ];

  // renderImageGrid function with actual images
  const renderImageGrid = () => {
    // Use the issueContent from props or fallback
    const issues = issueContent.length > 0 ? issueContent : [];
    
    // Use imageUrls from props or fallback
    const images = imageUrls.length > 0 ? imageUrls : Array(8).fill(categoryData.slug ? `/images/${categoryData.slug}.jpg` : '');
    
    return (
      <div style={{ columnCount: 2, columnGap: "1rem" }}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item, index) => {
          if (index >= issues.length) return null;
          
          // Create data for this specific image/issue
          const imageData = {
            name: issues[index] || `${categoryData.slug} image ${item}`,
            handle: `image_${item}`,
            followers: Math.floor(Math.random() * 1000),
            following: Math.floor(Math.random() * 500),
            posts: Math.floor(Math.random() * 100),
            bio: `This is ${categoryData.slug} image ${item} description`,
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

          return (
            <div
              key={item}
              ref={el => {
                if (imageRefs.current) {
                  imageRefs.current[index] = el;
                }
              }}
              style={{ marginBottom: "1rem" }}
            >
                <div className={`imageItem image-${item}`} onClick={() => {
                  router.push(`/categories/${categoryData.slug}/issue-${item.toString()}`);
                }}>
                  <img src={images[index]} alt={issues[index]} />
                  <div className="overlay">
                    <div className="title">
                      {issues[index] || `${categoryData.slug} ${item}`}
                    </div>
                    <div className="meta">
                      {Math.floor(Math.random() * 10) + 1}d ago · {Math.floor(Math.random() * 15) + 1} reports
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
    <Sheet.Root
        license="non-commercial" 
        presented={presented}
        onPresentedChange={handlePresentedChange}
        style={{ position: 'fixed', height: '100%', width: '100%', pointerEvents: presented ? 'auto' : 'none' }}>
            <Sheet.Portal>
            <Sheet.View
                className="Page-view"
                contentPlacement="right"
                swipeOvershoot={true}
                nativeEdgeSwipePrevention={true}
                style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50 }}
            >
                <Sheet.Backdrop className="Page-backdrop" />
                <Sheet.Content className="Page-content">
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
                    </Sheet.Content>
                    </Sheet.View>
                </Sheet.Portal>
                
    </Sheet.Root>
  );
} 