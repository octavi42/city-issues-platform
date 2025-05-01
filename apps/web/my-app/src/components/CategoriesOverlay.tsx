"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ExamplePage from "@/components/examples/Page/ExamplePage";

// Import categories data from an external file to reuse the same data
import { categories } from '@/data/categories';

interface CategoryType {
  name: string;
  slug: string;
  img: string;
  description: string;
  stats: {
    reported: number;
    solved: number;
    resolution: string;
  };
  severity: string;
  issues: string[];
  images: string[];
}

interface CategoriesOverlayProps {
  onClose: () => void; // Function to call when closing the overlay
  // Add any additional props here
}

export default function CategoriesOverlay({ onClose }: CategoriesOverlayProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Animation variants for the overlay background and the content box
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 30, scale: 0.95 }
  };

  return (
    // Overlay container (fixed position, covers screen)
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: 0.25 }}
      onClick={onClose}
      layout // Add layout prop for smoother animations
    >
      {/* Content container (prevents backdrop click from closing) */}
      <motion.div
        className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-3xl max-h-[90vh] overflow-y-auto relative text-black"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 30,
          mass: 1
        }}
        onClick={(e) => e.stopPropagation()}
        layout // Add layout prop for smoother animations
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl z-10"
          aria-label="Close categories overlay"
        >
          &times;
        </button>
        
        <h1 className="text-2xl font-bold mb-6">All Categories</h1>
        
        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((category: any) => (
            <div 
              key={category.slug}
              className="relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200"
              style={{
                transform: hoveredCard === category.slug ? 'translateY(-5px)' : 'translateY(0)',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={() => setHoveredCard(category.slug)}
              onMouseLeave={() => setHoveredCard(null)}
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
      </motion.div>
    </motion.div>
  );
} 