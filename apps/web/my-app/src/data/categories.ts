// Categories data

// Define types for better type safety
export interface CategoryStats {
  reported: number;
  solved: number;
  resolution: string;
}

export interface Category {
  name: string;
  slug: string;
  img: string;
  description: string;
  stats: CategoryStats;
  severity: string;
  issues: string[];
  images: string[];
}

// Enhanced categories data with all necessary information
export const categories: Category[] = [
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