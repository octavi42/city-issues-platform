"use client";

import React, { CSSProperties, useState, useEffect, useRef } from "react";
import Link from 'next/link';
// import anime from 'animejs/lib/anime.es.js'; // Remove old default import if unused
import { animate } from 'animejs'; // Correct named import
import ExamplePage from "@/components/examples/Page/ExamplePage";

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "white",
    color: "black",
    fontFamily: "'Schibsted Grotesk', Arial, sans-serif",
    padding: "1.5rem",
    maxWidth: "28rem",
    margin: "0 auto"
  } as CSSProperties,
  main: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem"
  } as CSSProperties,
  heading: {
    fontSize: "1.875rem",
    fontWeight: "700",
    lineHeight: "1.2",
    marginBottom: "1rem"
  } as CSSProperties,
  infoContainer: {
    position: "relative",
    cursor: "pointer"
  } as CSSProperties,
  infoContent: {
    overflow: "hidden",
    position: "relative",
    height: "4.5rem",
    paddingBottom: '1.5rem'
  } as CSSProperties,
  infoContentText: {
    fontSize: "1.25rem",
    fontWeight: 400,
    lineHeight: "1.25",
    color: "#787575",
    letterSpacing: "0.04em",
    padding: "0.75rem 0",
    borderRadius: "0.5rem",
    marginBottom: '0.5rem'
  } as CSSProperties,
  fadeOverlay: {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "3rem",
    background: "linear-gradient(to bottom, transparent, white)",
    pointerEvents: "none",
    opacity: 1,
  } as CSSProperties,
  sectionContainer: {
    marginBottom: "1rem"
  } as CSSProperties,
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem"
  } as CSSProperties,
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "600"
  } as CSSProperties,
  viewAllButton: {
    backgroundColor: "#F7F7F7",
    borderRadius: "9999px",
    padding: "0.5rem 1.25rem",
    fontSize: "0.875rem", 
    fontWeight: "700",
    letterSpacing: "0.07em"
  } as CSSProperties,
  categoryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "1rem"
  } as CSSProperties,
  categoryCardLink: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'block'
  } as CSSProperties,
  categoryCard: {
    position: "relative",
    borderRadius: "1.5rem",
    overflow: "hidden",
    aspectRatio: "1/1"
  } as CSSProperties,
  categoryImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  } as CSSProperties,
  categoryLabel: {
    position: "absolute",
    bottom: "0.75rem",
    left: "0",
    right: "0", 
    margin: "0 auto",
    width: "6rem",
    display: "flex",
    justifyContent: "center",
    zIndex: "10"
  } as CSSProperties,
  categoryBadge: {
    backdropFilter: "blur(11px)",
    backgroundColor: "rgba(255, 255, 255, 0.51)",
    borderRadius: "9999px",
    padding: "0.25rem 0.75rem",
    fontSize: "0.75rem",
    fontWeight: "600",
    letterSpacing: "0.07em"
  } as CSSProperties,
  infoText: {
    color: "#787575",
    fontSize: "1.125rem",
    letterSpacing: "0.04em",
    marginBottom: "1rem"
  } as CSSProperties,
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "0.75rem"
  } as CSSProperties,
  statsCard: (bgColor: string) => ({
    borderRadius: "1.5rem",
    padding: "0.75rem",
    backgroundColor: bgColor
  } as CSSProperties),
  statValue: {
    fontSize: "1.875rem",
    fontWeight: "700" 
  } as CSSProperties,
  statLabel: {
    fontSize: "0.875rem"
  } as CSSProperties,
  issuesList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem"
  } as CSSProperties,
  issueCard: {
    borderRadius: "1.5rem",
    padding: "1rem",
    backgroundColor: "#DBF24C"
  } as CSSProperties,
  issueText: {
    color: "#595959",
    fontSize: "1.125rem"
  } as CSSProperties,
  howToUseCard: {
    borderRadius: "1.5rem",
    padding: "1.25rem",
    backgroundColor: "#97B9FF",
    color: "white",
    marginBottom: "2.5rem"
  } as CSSProperties,
  dotsContainer: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem"
  } as CSSProperties,
  dot: {
    fontSize: "1.5rem",
    fontWeight: "600"
  } as CSSProperties
};

// Enhanced categories data with all necessary information
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
      "Main street damage", 
      "Intersection hazard", 
      "Deep pothole on bridge", 
      "Sidewalk crack danger", 
      "Bicycle lane damage", 
      "Highway exit pothole", 
      "Residential street damage", 
      "School zone hazard"
    ],
    images: [
      "/images/pothole.jpg",
      "/images/pothole.jpg",
      "/images/pothole.jpg",
      "/images/pothole.jpg",
      "/images/pothole.jpg",
      "/images/pothole.jpg",
      "/images/pothole.jpg",
      "/images/pothole.jpg"
    ]
  }
];

const INITIAL_COLLAPSED_HEIGHT = '4.5rem';

export default function Home() {
  const [infoOpen, setInfoOpen] = useState(false);
  const infoContentRef = useRef<HTMLDivElement>(null);
  const fadeOverlayRef = useRef<HTMLDivElement>(null);

  const toggleInfo = () => {
    setInfoOpen(!infoOpen);
  };

  useEffect(() => {
    if (!infoContentRef.current || !fadeOverlayRef.current) return;

    const contentEl = infoContentRef.current;
    let targetHeight = INITIAL_COLLAPSED_HEIGHT;

    if (infoOpen) {
      const currentHeight = contentEl.style.height;
      contentEl.style.height = 'auto';
      targetHeight = `${contentEl.scrollHeight}px`;
      contentEl.style.height = currentHeight;
    }

    // Animate height
    animate(
      contentEl,
      {
        height: targetHeight,
        paddingBottom: infoOpen ? '0rem' : '1.5rem',
        duration: 500,
        easing: 'easeOutCubic'
      }
    );

    // Animate fade overlay
    animate(
      fadeOverlayRef.current,
      {
        opacity: infoOpen ? 0 : 1,
        duration: 300,
        easing: 'easeOutCubic'
      }
    );

  }, [infoOpen]);

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        {/* Header */}
        <div>
          <h1 style={styles.heading}>
            Hello, from<br />
            Cluj-Napoca
          </h1>
          
          {/* Expandable Info Section */}
          <div 
            style={styles.infoContainer}
            onClick={toggleInfo} 
          >
            <div ref={infoContentRef} style={styles.infoContent}>
              <div style={styles.infoContentText}>
                <p>Cluj-Napoca is the second most populous city in Romania and the seat of Cluj County. Located in northwestern Romania, the city is situated approximately 450 kilometers from Bucharest.</p>
                <br />
                <p>The city is one of the most important academic, cultural, industrial and business centers in Romania. Home to the country's largest university, Babeș-Bolyai University, Cluj is also a major IT and innovation hub in Eastern Europe.</p>
              </div>
            </div>
            <div ref={fadeOverlayRef} style={styles.fadeOverlay}></div>
          </div>
        </div>

        {/* Categories Section */}
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Categories</h2>
            <div style={styles.viewAllButton}>
              <span>View all</span>
            </div>
          </div>
          
          <div style={styles.categoryGrid}>
            {categories.map((category) => (
              <div 
                key={category.slug} 
                style={styles.categoryCard}
              >
                <ExamplePage 
                  key={category.slug} 
                  categoryData={{
                    title: category.name,
                    description: category.description,
                    stats: category.stats,
                    severity: category.severity,
                    slug: category.slug
                  }}
                  issueContent={category.issues}
                  imageUrls={category.images}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div style={styles.sectionContainer}>
          <p style={styles.infoText}>
            The official language is Romanian. Most educated people born after about 1970 will speak reasonably good English and will likely be proficient in
          </p>
          
          <div style={styles.statsGrid}>
            {/* Stats Card: Issues */}
            <div style={styles.statsCard("#DBF24C")}>
              <p style={styles.statValue}>40</p>
              <p style={styles.statLabel}>issues</p>
            </div>
            
            {/* Stats Card: Response Time */}
            <div style={styles.statsCard("#EFEFEF")}>
              <p style={styles.statValue}>5s</p>
              <p style={styles.statLabel}>avg response time</p>
            </div>
            
            {/* Stats Card: Temperature */}
            <div style={styles.statsCard("#EFEFEF")}>
              <p style={styles.statValue}>25</p>
              <p style={styles.statLabel}>degrees celsius</p>
            </div>
            
            {/* Stats Card: Critical Problems */}
            <div style={styles.statsCard("#FE7A71")}>
              <p style={styles.statValue}>5</p>
              <p style={styles.statLabel}>critical problems</p>
            </div>
          </div>
        </div>

        {/* Issues Section */}
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Issues</h2>
            <div style={styles.viewAllButton}>
              <span>View all</span>
            </div>
          </div>
          
          <div style={styles.issuesList}>
            {/* Issue Card 1 */}
            <div style={styles.issueCard}>
              <p style={styles.issueText}>"Lorem Ipsum is simply dummy text of the printing and typesetting industry."</p>
            </div>
            
            {/* Issue Card 2 */}
            <div style={styles.issueCard}>
              <p style={styles.issueText}>"Lorem Ipsum is simply dummy text of the printing and typesetting industry."</p>
            </div>
            
            {/* Issue Card 3 */}
            <div style={styles.issueCard}>
              <p style={styles.issueText}>"Lorem Ipsum is simply dummy text of the printing and typesetting industry."</p>
            </div>
          </div>
        </div>

        {/* How to Use Section */}
        <div style={styles.howToUseCard}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>How to use?</h2>
            <div style={styles.dotsContainer}>
              <span style={styles.dot}>→</span>
              <span style={styles.dot}>.</span>
              <span style={styles.dot}>.</span>
              <span style={styles.dot}>.</span>
              <span style={styles.dot}>.</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
