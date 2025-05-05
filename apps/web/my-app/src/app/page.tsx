"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from 'next/navigation';
import { animate } from 'animejs';
import { categories as staticCategories } from '@/data/categories';
import { fetchCategories } from '@/lib/neo4j-queries';
import { Category } from '@/lib/neo4j-schema';
import { Skeleton } from "@/components/ui/skeleton";
import { User } from 'lucide-react';
import {CategoriesSheetWrapper} from "@/components/modals/Categories";

const INITIAL_COLLAPSED_HEIGHT = 'h-[4.5rem]';

export default function Home() {
  const router = useRouter();

  const [infoOpen, setInfoOpen] = useState(false);
  const infoContentRef = useRef<HTMLDivElement>(null);
  const fadeOverlayRef = useRef<HTMLDivElement>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories from Neo4j
  useEffect(() => {
    const getCategories = async () => {
      try {
        setIsLoading(true);
        // Intentionally wrapping the call in a try/catch to handle server-side errors
        // like missing env variables gracefully
        try {
          const fetchedCategories = await fetchCategories();
          setCategories(fetchedCategories);
        } catch (err) {
          console.error("Failed to fetch categories from Neo4j:", err);
          // Fallback to static categories to avoid breaking the UI
          setCategories(staticCategories.map(cat => ({
            category_id: cat.slug,
            name: cat.name,
            description: cat.description || '',
          })));
        }
      } catch (err) {
        setError("Failed to load categories");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    getCategories();
  }, []);

  // Memoize random categories to prevent re-shuffling on hover
  const randomCategories = useMemo(() => {
    if (categories.length === 0) return [];
    
    // Make a copy to avoid modifying the original array
    const categoriesCopy = [...categories];
    const result = [];
    
    // Get up to 4 categories randomly
    const numToSelect = Math.min(4, categoriesCopy.length);
    
    for (let i = 0; i < numToSelect; i++) {
      const randomIndex = Math.floor(Math.random() * categoriesCopy.length);
      result.push(categoriesCopy.splice(randomIndex, 1)[0]);
    }
    
    return result;
  }, [categories]); // Only recalculate when categories array changes

  const toggleInfo = () => {
    setInfoOpen(!infoOpen);
  };

  useEffect(() => {
    if (!infoContentRef.current || !fadeOverlayRef.current) return;

    const contentEl = infoContentRef.current;
    let targetHeightValue = '4.5rem';
    let targetPaddingBottom = '1.5rem';

    if (infoOpen) {
      const currentHeight = contentEl.style.height;
      contentEl.style.height = 'auto';
      targetHeightValue = `${contentEl.scrollHeight}px`;
      targetPaddingBottom = '0rem';
      contentEl.style.height = currentHeight;
    } else {
      if (!contentEl.classList.contains('h-[4.5rem]')) {
        contentEl.classList.add('h-[4.5rem]');
      }
    }

    animate(
      contentEl,
      {
        height: targetHeightValue,
        paddingBottom: targetPaddingBottom,
        duration: 500,
        easing: 'easeOutCubic',
        begin: () => {
          if (infoOpen) {
            contentEl.classList.remove('h-[4.5rem]');
          }
        },
        complete: () => {
          if (infoOpen) {
            contentEl.style.height = 'auto';
          } else {
            if (!contentEl.classList.contains('h-[4.5rem]')) {
              contentEl.classList.add('h-[4.5rem]');
            }
          }
        }
      }
    );

    animate(
      fadeOverlayRef.current,
      {
        opacity: infoOpen ? 0 : 1,
        duration: 300,
        easing: 'easeOutCubic'
      }
    );

  }, [infoOpen]);

  const openCategoriesSheet = () => {
    
  };

  const navigateToAccount = () => {
    router.push('/me');
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-['Schibsted_Grotesk',_Arial,_sans-serif] p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg">
        <main className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold leading-tight">
              Hello, from<br />
              Cluj-Napoca
            </h1>
            
            <button 
              onClick={navigateToAccount}
              className="rounded-full h-12 w-12 bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors duration-150"
              aria-label="Account"
            >
              <User size={20} />
            </button>
          </div>
          
          <div 
            className="relative cursor-pointer"
            onClick={toggleInfo} 
          >
            <div 
              ref={infoContentRef} 
              className={`overflow-hidden relative ${INITIAL_COLLAPSED_HEIGHT} pb-6 mb-8`} 
            >
              <div className="text-lg font-normal leading-relaxed text-gray-500 tracking-normal py-3 rounded-lg mb-2">
                <p>Cluj-Napoca is the second most populous city in Romania and the seat of Cluj County. Located in northwestern Romania, the city is situated approximately 450 kilometers from Bucharest.</p>
                <br />
                <p>The city is one of the most important academic, cultural, industrial and business centers in Romania. Home to the country&apos;s largest university, Babeș-Bolyai University, Cluj is also a major IT and innovation hub in Eastern Europe.</p>
              </div>
            </div>
            <div 
              ref={fadeOverlayRef} 
              className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" 
              style={{ opacity: 1 }}
            ></div>
          </div>

          <div className="pb-12">
            <div className="grid grid-cols-2 gap-5">
              <div className="rounded-2xl p-4 bg-[#fecc02] ">
                <p className="text-3xl font-bold text-white">40</p>
                <p className="text-sm text-white">issues</p>
              </div>
              
              <div className="rounded-2xl p-4 bg-[#ffffff] border border-gray-200">
                <p className="text-3xl font-bold">5s</p>
                <p className="text-sm text-gray-600">avg response time</p>
              </div>
              
              <div className="rounded-2xl p-4 bg-[#ffffff] border border-gray-200">
                <p className="text-3xl font-bold">25</p>
                <p className="text-sm text-gray-600">degrees celsius</p>
              </div>
              
              <div className="rounded-2xl p-4 bg-[#ff5900] ">
                <p className="text-3xl font-bold text-white">5</p>
                <p className="text-sm text-red-100">critical problems</p>
              </div>
            </div>
          </div>

          <div className="pb-12">
            <div className="flex justify-between items-center pb-8">
                <h2 className="text-2xl font-semibold">Categories</h2>
              <CategoriesSheetWrapper />
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              {isLoading ? (
                // Shadcn UI Skeleton components for loading state
                Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton 
                    key={`skeleton-${index}`}
                    className="aspect-square rounded-2xl border border-gray-50"
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <Skeleton className="w-2/3 h-6" />
                    </div>
                  </Skeleton>
                ))
              ) : error ? (
                <div className="col-span-2 p-4 text-red-500">
                  {error}
                </div>
              ) : randomCategories.length > 0 ? (
                randomCategories.map((category) => {
                  // Create slug from category name
                  const slug = category.name?.toLowerCase().replace(/\s+/g, '-') || category.category_id;
                  
                  return (
                    <div 
                      key={category.category_id} 
                      onClick={() => router.push(`/categories/${slug}`)}
                      className={`relative rounded-2xl border border-gray-100 overflow-hidden aspect-square cursor-pointer transition-transform duration-200 ease-out ${hoveredCard === category.category_id ? '-translate-y-1' : ''}`}
                      onMouseEnter={() => setHoveredCard(category.category_id)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div className="w-full h-full bg-gray-50 flex items-center justify-center p-4">
                        <span className="text-gray-400 font-medium text-center">{category.name}</span> 
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 p-4 text-gray-500">
                  No categories found
                </div>
              )}
            </div>
          </div>

          <div className="pb-12">
            <div className="flex justify-between items-center pb-8">
              <h2 className="text-2xl font-semibold">Well Maintained Elements</h2>
            </div>
            
            <div className="overflow-x-auto pb-4 -mx-8 px-8">
              <div className="flex gap-4 w-max pr-8">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton 
                      key={`element-skeleton-${index}`}
                      className="h-40 w-60 shrink-0 rounded-2xl"
                    />
                  ))
                ) : (
                  <>
                    <div className="h-40 w-60 shrink-0 rounded-2xl bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">Image 1</span>
                    </div>
                    <div className="h-40 w-60 shrink-0 rounded-2xl bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">Image 2</span>
                    </div>
                    <div className="h-40 w-60 shrink-0 rounded-2xl bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">Image 3</span>
                    </div>
                    <div className="h-40 w-60 shrink-0 rounded-2xl bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">Image 4</span>
                    </div>
                    <div className="h-40 w-60 shrink-0 rounded-2xl bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">Image 5</span>
                    </div>
                    <div className="h-40 w-40 shrink-0 rounded-2xl bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors">
                      <span className="text-gray-600 font-medium">View all</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="pb-12">
            <div className="flex justify-between items-center pb-8">
              <h2 className="text-2xl font-semibold">Issues</h2>
              <div className="bg-gray-100 rounded-full py-2 px-4 text-sm font-semibold tracking-wide">
                <span>View all</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-5">
              {isLoading ? (
                // Shadcn UI Skeleton components for loading state
                Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton 
                    key={`issue-skeleton-${index}`}
                    className="h-24 rounded-2xl p-6"
                  >
                    <Skeleton className="w-4/5 h-5 mb-2" />
                    <Skeleton className="w-3/5 h-5" />
                  </Skeleton>
                ))
              ) : (
                <>
                  <div className="rounded-2xl p-6 bg-[#DBF24C] border border-lime-200">
                    <p className="text-lime-900 text-base">&ldquo;Lorem Ipsum is simply dummy text of the printing and typesetting industry.&rdquo;</p>
                  </div>
                  
                  <div className="rounded-2xl p-6 bg-[#DBF24C] border border-lime-200">
                    <p className="text-lime-900 text-base">&ldquo;Lorem Ipsum is simply dummy text of the printing and typesetting industry.&rdquo;</p>
                  </div>
                  
                  <div className="rounded-2xl p-6 bg-[#DBF24C] border border-lime-200">
                    <p className="text-lime-900 text-base">&ldquo;Lorem Ipsum is simply dummy text of the printing and typesetting industry.&rdquo;</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="rounded-2xl p-8 bg-[#97B9FF] text-white mb-10 border border-blue-300">
            <div className="flex justify-between items-center"> 
              <h2 className="text-2xl font-semibold">How to use?</h2>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-semibold">→</span> 
                <span className="text-2xl font-semibold opacity-60">.</span>
                <span className="text-2xl font-semibold opacity-40">.</span>
                <span className="text-2xl font-semibold opacity-20">.</span>
                <span className="text-2xl font-semibold opacity-10">.</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
