"use client";

import { useParams, useRouter } from 'next/navigation';
import React, { CSSProperties, useState, useEffect, useRef } from "react";
import '@/components/examples/Page/ExamplePage.css';
import '@/components/examples/Page/Page.css';
import './page.css';
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
  } as CSSProperties
};

// Use the same category data as in the main page
const categories = [
  { 
    name: "Burnings", 
    slug: "burnings", 
    img: "/images/burning.jpg",
    description: "Reports of burnings around the city, including trash fires, controlled burns, and other fire-related issues that may pose safety risks to residents.",
    stats: {
      reported: 39,
      solved: 200,
      resolution: "4d"
    },
    severity: "high",
    issues: [
      "Fire hazard near park", 
      "Trash burning in alley", 
      "Forest fire risk zone", 
      "Burnt trash bins", 
      "Smoking area fire risk", 
      "Campfire remains", 
      "Burnt debris", 
      "Flammable waste"
    ],
    images: [
      "/images/burning.jpg",
      "/images/burning.jpg",
      "/images/burning.jpg",
      "/images/burning.jpg",
      "/images/burning.jpg",
      "/images/burning.jpg",
      "/images/burning.jpg",
      "/images/burning.jpg"
    ]
  },
  { 
    name: "Traffic", 
    slug: "traffic", 
    img: "/images/traffic.jpg",
    description: "Traffic congestion, road closures, accidents, and other transportation-related issues affecting mobility throughout Cluj-Napoca.",
    stats: {
      reported: 104,
      solved: 387,
      resolution: "2d"
    },
    severity: "medium",
    issues: [
      "Rush hour congestion", 
      "Broken traffic light", 
      "Road construction", 
      "Pedestrian crossing issue", 
      "Illegal parking zone", 
      "Speeding area", 
      "Bus lane violation", 
      "Missing road signs"
    ],
    images: [
      "/images/traffic.jpg",
      "/images/traffic.jpg",
      "/images/traffic.jpg",
      "/images/traffic.jpg",
      "/images/traffic.jpg",
      "/images/traffic.jpg",
      "/images/traffic.jpg",
      "/images/traffic.jpg"
    ]
  },
  { 
    name: "Graffiti", 
    slug: "graffiti", 
    img: "/images/graffiti.jpg",
    description: "Unwanted spray paint, markings, and visual pollution on city property and public spaces.",
    stats: {
      reported: 87,
      solved: 435,
      resolution: "3d"
    },
    severity: "low",
    issues: [
      "Wall art defacement", 
      "Bridge graffiti", 
      "Public property damage", 
      "School wall tagging", 
      "Historic building vandalism", 
      "Park bench graffiti", 
      "Bus stop markings", 
      "Underpass tagging"
    ],
    images: [
      "/images/graffiti.jpg",
      "/images/graffiti.jpg",
      "/images/graffiti.jpg",
      "/images/graffiti.jpg",
      "/images/graffiti.jpg",
      "/images/graffiti.jpg",
      "/images/graffiti.jpg",
      "/images/graffiti.jpg"
    ]
  },
  { 
    name: "Potholes", 
    slug: "potholes", 
    img: "/images/pothole.jpg",
    description: "Road damage including potholes, cracks, and surface deterioration that can cause vehicle damage or safety hazards for drivers and cyclists.",
    stats: {
      reported: 39,
      solved: 200,
      resolution: "4d"
    },
    severity: "high",
    issues: [
      "Large pothole on Main Street",
      "Dangerous crater on 5th Avenue",
      "Multiple potholes near school zone",
      "Deep pothole causing accidents",
      "Road damage after recent storm",
      "Pothole needs urgent repair",
      "Growing pothole on busy intersection",
      "Multiple tire damages reported"
    ],
    images: [
      "/images/pothole1.jpg",
      "/images/pothole2.jpg",
      "/images/pothole3.jpg",
      "/images/pothole4.jpg",
      "/images/pothole5.jpg",
      "/images/pothole6.jpg",
      "/images/pothole7.jpg",
      "/images/pothole8.jpg"
    ]
  },
];

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  
  // Find the category data based on the slug
  const category = categories.find(cat => cat.slug === slug);
  
  // State and refs for image visibility
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // If category not found, redirect to home
  useEffect(() => {
    if (!category) {
      router.push('/');
    }
  }, [category, router]);

  const handleBack = () => {
    router.push('/');
  };
  
  if (!category) {
    return null; // Return nothing while redirecting
  }

  // renderImageGrid function with actual images
  const renderImageGrid = () => {
    // Use the issueContent from category or fallback
    const issues = category.issues || [];
    
    // Use imageUrls from category or fallback
    const images = category.images || Array(8).fill(category.slug ? `/images/${category.slug}.jpg` : '');
    
    return (
      <div style={{ columnCount: 2, columnGap: "1rem" }}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item, index) => {
          if (index >= issues.length) return null;
          
          // Create data for this specific image/issue
          const imageData = {
            name: issues[index] || `${category.slug} image ${item}`,
            handle: `image_${item}`,
            followers: Math.floor(Math.random() * 1000),
            following: Math.floor(Math.random() * 500),
            posts: Math.floor(Math.random() * 100),
            bio: `This is ${category.slug} image ${item} description`,
            content: [
              {
                username: `${category.slug} image ${item}`,
                handle: `image_${item}`,
                hoursPast: Math.floor(Math.random() * 24),
                content: [`Details about ${category.slug} image ${item}`],
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
                  <div className={`imageItem image-${item}`}>
                    <img src={images[index]} alt={issues[index]} />
                    <div className="overlay">
                      <div className="title">
                        {issues[index] || `${category.slug} ${item}`}
                      </div>
                      <div className="meta">
                        {Math.floor(Math.random() * 10) + 1}d ago · {Math.floor(Math.random() * 15) + 1} reports
                      </div>
                    </div>
                  </div>
                }
              />
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <div style={pageStyles.container}>
      <div style={pageStyles.headerContainer}>
        <button 
          onClick={handleBack}
          style={pageStyles.backButton}
          aria-label="Back to home"
        >
          ←
        </button>
        <h1 style={pageStyles.heading}>{category.name}</h1>
      </div>
      <p style={pageStyles.description}>{category.description}</p>
      
      {/* Stats Container */}
      <div style={pageStyles.statsContainer}>
        <div style={pageStyles.statsRow}>
          <div style={pageStyles.statItem}>
            <div style={pageStyles.statValue}>{category.stats.reported}</div>
            <div style={pageStyles.statLabel}>reported issues</div>
          </div>
          <div style={pageStyles.statItem}>
            <div style={pageStyles.statValue}>{category.stats.solved}</div>
            <div style={pageStyles.statLabel}>solved issues</div>
          </div>
          <div style={pageStyles.statItem}>
            <div style={pageStyles.statValue}>{category.stats.resolution}</div>
            <div style={pageStyles.statLabel}>resolution time</div>
          </div>
        </div>
      </div>
      
      {/* Severity Container */}
      <div style={pageStyles.severityContainer}>
        <div style={category.severity === "high" ? pageStyles.highSeverity : { ...pageStyles.mediumSeverity, opacity: category.severity === "medium" ? 1 : 0.5 }}>High</div>
        <div style={category.severity === "medium" ? pageStyles.mediumSeverity : { ...pageStyles.mediumSeverity, opacity: category.severity === "medium" ? 1 : 0.5 }}>Medium</div>
        <div style={category.severity === "low" ? pageStyles.lowSeverity : { ...pageStyles.lowSeverity, opacity: category.severity === "low" ? 1 : 0.5 }}>Low</div>
      </div>

      {/* Images Grid */}
      {renderImageGrid()}
    </div>
  );
} 