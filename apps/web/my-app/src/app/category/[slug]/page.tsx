"use client";

import { useParams, useRouter } from 'next/navigation';
import React, { CSSProperties, useState, useEffect, useRef } from "react";
import styles from './page.module.css';

import { Sheet, createComponentId } from "@silk-hq/components";
import { ExampleSheetWithStackingData } from '@/components/examples/SheetWithStacking/ExampleSheetWithStackingData';
import { ExampleSheetWithStacking } from '@/components/examples/SheetWithStacking/ExampleSheetWithStacking';
import { 
  SheetWithStackingStack, 
  SheetWithStackingRoot, 
  SheetWithStackingView 
} from '@/components/examples/SheetWithStacking/SheetWithStacking';
import { ExampleSheetWithStackingView } from '@/components/examples/SheetWithStacking/ExampleSheetWithStacking';

const pageStyles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "white",
    color: "black",
    fontFamily: "'Schibsted Grotesk', Arial, sans-serif",
    padding: "1.5rem",
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

// Mock data for different categories
const categoryData = {
  "burnings": {
    title: "Burnings",
    description: "Reports related to fires, burn marks, or damaged areas due to burning in public spaces.",
    stats: {
      reported: 39,
      solved: 200,
      resolution: "4d"
    },
    severity: "high"
  },
  "traffic": {
    title: "Traffic Issues",
    description: "Problems with traffic signals, road signs, congestion areas or other traffic-related concerns.",
    stats: {
      reported: 104,
      solved: 387,
      resolution: "2d" 
    },
    severity: "medium"
  },
  "graffiti": {
    title: "Graffiti",
    description: "Unwanted spray paint, markings, and visual pollution on city property and public spaces.",
    stats: {
      reported: 87,
      solved: 435,
      resolution: "3d"
    },
    severity: "low"
  },
  "potholes": {
    title: "Road Damage",
    description: "The official language is Romanian. Most educated people born after about 1970 will speak reasonably good English and will likely be proficient in",
    stats: {
      reported: 39,
      solved: 200,
      resolution: "4d"
    },
    severity: "high"
  }
};

// Image aspect ratios to create varying heights
const imageAspectRatios = [
  "1/1",      // Square
  "4/3",      // Standard landscape
  "3/4",      // Portrait
  "16/9",     // Widescreen
  "2/3",      // Portrait
  "3/2",      // Landscape
  "1/1.5",    // Tall portrait
  "1.5/1"     // Wide landscape
];

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  
  // Create a stable Silk sheet context for this page
  const sheetContext = useRef(createComponentId()).current;

  // State for modal visibility and selected issue
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  // State and refs for category data and image visibility
  const slug = params?.slug as string || 'category';
  const data = categoryData[slug as keyof typeof categoryData] || {
    title: slug.replace(/-/g, ' '),
    description: "Description for this category",
    stats: { reported: 0, solved: 0, resolution: "0d" },
    severity: "low"
  };
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);



  // Function to open/close the sheet directly with state
  const openIssueSheet = (issueId: number) => {
    setSelectedIssueId(issueId.toString());
  };

  const closeIssueSheet = () => {
    setSelectedIssueId(null);
  };

  // renderImageGrid function - use adjusted imageItem style
  const renderImageGrid = () => {
    return (
      <div style={{ columnCount: 2, columnGap: "1rem" }}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item, index) => {
          // Create data for this specific image/issue
          const imageData = {
            name: `${slug} image ${item}`,
            handle: `image_${item}`,
            followers: Math.floor(Math.random() * 1000),
            following: Math.floor(Math.random() * 500),
            posts: Math.floor(Math.random() * 100),
            bio: `This is ${slug} image ${item} description`,
            content: [
              {
                username: `${slug} image ${item}`,
                handle: `image_${item}`,
                hoursPast: Math.floor(Math.random() * 24),
                content: [`Details about ${slug} image ${item}`],
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
              <ExampleSheetWithStacking 
                data={imageData}
                trigger={
                  <div className={styles.imageItem}>
                    {slug} image {item}
                  </div>
                }
              />
            </div>
          );
        })}
        
        {/* Test with direct approach */}
        <div style={{ marginBottom: "1rem" }}>
          <SheetWithStackingRoot>
            <Sheet.Trigger asChild>
              <div className={styles.imageItem}>
                Test Direct Trigger
              </div>
            </Sheet.Trigger>
            <SheetWithStackingView>
              <div style={{ padding: "2rem" }}>
                <h2>Test Sheet Content</h2>
                <p>This is a test sheet with direct Sheet.Trigger</p>
              </div>
            </SheetWithStackingView>
          </SheetWithStackingRoot>
        </div>

        {/* Test with ExampleSheetWithStackingView */}
        <div style={{ marginBottom: "1rem" }}>
          <SheetWithStackingRoot>
            <Sheet.Trigger asChild>
              <div className={styles.imageItem}>
                Test With ExampleSheetWithStackingView
              </div>
            </Sheet.Trigger>
            <SheetWithStackingView>
              <ExampleSheetWithStackingView 
                data={{
                  name: "Test Image Direct",
                  handle: "test_direct",
                  followers: 999,
                  following: 555,
                  posts: 77,
                  bio: "This is a test with direct ExampleSheetWithStackingView",
                  content: [
                    {
                      username: "Test Direct",
                      handle: "test_direct",
                      hoursPast: 2,
                      content: ["This is a test with direct ExampleSheetWithStackingView"],
                      commentsCount: 42,
                      sharesCount: 21,
                      likesCount: 99
                    }
                  ]
                }}
              />
            </SheetWithStackingView>
          </SheetWithStackingRoot>
        </div>
      </div>
    );
  };

  // Main component return statement
  return (
    <SheetWithStackingStack>
      <div style={pageStyles.container}>
        <div style={pageStyles.headerContainer}>
          <button
            onClick={() => router.push('/')}
            style={pageStyles.backButton}
            aria-label="Back to home"
          >
            ←
          </button>
          <h1 style={pageStyles.heading}>{data.title}</h1>
        </div>
        <p style={pageStyles.description}>{data.description}</p>
        {/* Stats Container */}
        <div style={pageStyles.statsContainer}>
          <div style={pageStyles.statsRow}>
            <div style={pageStyles.statItem}>
              <div style={pageStyles.statValue}>{data.stats.reported}</div>
              <div style={pageStyles.statLabel}>reported issues</div>
            </div>
            <div style={pageStyles.statItem}>
              <div style={pageStyles.statValue}>{data.stats.solved}</div>
              <div style={pageStyles.statLabel}>solved issues</div>
            </div>
            <div style={pageStyles.statItem}>
              <div style={pageStyles.statValue}>{data.stats.resolution}</div>
              <div style={pageStyles.statLabel}>resolution time</div>
            </div>
          </div>
        </div>
        {/* Severity Container */}
        <div style={pageStyles.severityContainer}>
          <div style={data.severity === "high" ? pageStyles.highSeverity : { ...pageStyles.mediumSeverity, opacity: data.severity === "medium" ? 1 : 0.5 }}>High</div>
          <div style={data.severity === "medium" ? pageStyles.mediumSeverity : { ...pageStyles.mediumSeverity, opacity: data.severity === "medium" ? 1 : 0.5 }}>Medium</div>
          <div style={data.severity === "low" ? pageStyles.lowSeverity : { ...pageStyles.lowSeverity, opacity: data.severity === "low" ? 1 : 0.5 }}>Low</div>
        </div>

        {/* Images Grid */}
        {renderImageGrid()}
      </div>
    </SheetWithStackingStack>
  );
} 