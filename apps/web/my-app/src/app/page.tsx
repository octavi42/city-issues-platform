"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from 'next/navigation';
import { animate } from 'animejs';
import { categories as staticCategories } from '@/data/categories';
import { fetchCategories, fetchMaintainedPhotos, fetchLatestIssues, countIssues, countMaintainedElements, countCriticalProblems } from '@/lib/neo4j-queries';
import { Category, DetectionEvent } from '@/lib/neo4j-schema';
import { Skeleton } from "@/components/ui/skeleton";
import { User } from 'lucide-react';
import {CategoriesSheetWrapper} from "@/components/modals/Categories";
import FloatingButton from "./components/FloatingButton";
import Image from "next/image";

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
  const [maintainedPhotos, setMaintainedPhotos] = useState<{photo_id: string, url?: string, title?: string}[]>([]);
  const [issues, setIssues] = useState<DetectionEvent[]>([]);
  const [issueCount, setIssueCount] = useState<number | null>(null);
  const [maintainedCount, setMaintainedCount] = useState<number | null>(null);
  const [criticalCount, setCriticalCount] = useState<number | null>(null);

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

  // Fetch maintained photos
  useEffect(() => {
    const getMaintainedPhotos = async () => {
      try {
        setIsLoading(true);
        try {
          const photos = await fetchMaintainedPhotos(3);
          setMaintainedPhotos(photos);
        } catch (err) {
          console.error("Failed to fetch maintained photos from Neo4j:", err);
          // Fallback to mock data
          setMaintainedPhotos([
            { photo_id: "photo1", url: "/images/maintained-1.jpg", title: "Park Maintenance" },
            { photo_id: "photo2", url: "/images/maintained-2.jpg", title: "Street Lighting" },
            { photo_id: "photo3", url: "/images/maintained-3.jpg", title: "Public Garden" }
          ]);
        }
      } catch (err) {
        console.error("Failed to load maintained photos:", err);
      } finally {
        setIsLoading(false);
      }
    };

    getMaintainedPhotos();
  }, []);

  // Fetch latest issues
  useEffect(() => {
    const getLatestIssues = async () => {
      try {
        setIsLoading(true);
        const latestIssues = await fetchLatestIssues(3);
        setIssues(latestIssues);
      } catch (err) {
        console.error("Failed to fetch latest issues from Neo4j:", err);
        setError("Failed to load issues");
      } finally {
        setIsLoading(false);
      }
    };

    getLatestIssues();
  }, []);

  // Fetch counts for issues, maintained elements, and critical problems
  useEffect(() => {
    async function fetchCounts() {
      setIsLoading(true);
      try {
        const [issues, maintained, critical] = await Promise.all([
          countIssues(),
          countMaintainedElements(),
          countCriticalProblems()
        ]);
        setIssueCount(issues);
        setMaintainedCount(maintained);
        setCriticalCount(critical);
      } catch (err) {
        setError('Failed to load counts');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCounts();
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

  const navigateToAccount = () => {
    router.push('/me', { scroll: false });
  };

  const handlePhotoClick = (photoId: string) => {
    router.push(`/image/${photoId}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-['Schibsted_Grotesk',_Arial,_sans-serif] p-8 flex flex-col items-center justify-center">
      <FloatingButton />

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
              <div className="rounded-2xl p-4 bg-[#F6F7FB] shadow-none">
                <div className="text-3xl font-bold text-[#1A237E]">
                  {issueCount !== null ? issueCount : '*'}
                </div>
                <p className="text-sm text-[#1A237E]/70">issues reported</p>
              </div>
              
              <div className="rounded-2xl p-4 bg-[#F6FBF7] shadow-none">
                <div className="text-3xl font-bold text-[#388E3C]">
                  {maintainedCount !== null ? maintainedCount : '*'}
                </div>
                <p className="text-sm text-[#388E3C]/70">well maintained</p>
              </div>
              
              <div className="rounded-2xl p-4 bg-[#FBF9F6] shadow-none">
                <div className="text-3xl font-bold text-[#B26A00]">5s</div>
                <p className="text-sm text-[#B26A00]/70">avg response time</p>
              </div>
              
              <div className="rounded-2xl p-4 bg-[#FBF6F6] shadow-none">
                <div className="text-3xl font-bold text-[#D32F2F]">
                  {criticalCount !== null ? criticalCount : '*'}
                </div>
                <p className="text-sm text-[#D32F2F]/70">critical problems</p>
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
                      onClick={() => router.push(`/categories/${slug}`, { scroll: false })}
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
                  Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton 
                      key={`element-skeleton-${index}`}
                      className="h-40 w-60 shrink-0 rounded-2xl"
                    />
                  ))
                ) : (
                  <>
                    {maintainedPhotos.map((photo) => (
                      <div 
                        key={photo.photo_id} 
                        className="h-40 w-60 shrink-0 rounded-2xl bg-gray-100 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity relative"
                        onClick={() => handlePhotoClick(photo.photo_id)}
                      >
                        {photo.url ? (
                          <>
                            <Image 
                              src={photo.url} 
                              alt={photo.title || 'Maintained Element'} 
                              className="w-full h-full object-cover"
                              width={240}
                              height={160}
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                              <span className="text-white text-sm font-medium">{photo.title || 'Maintained Element'}</span>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-gray-600">{photo.title || 'Maintained Element'}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    <div 
                      className="h-40 w-40 shrink-0 rounded-2xl bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                      onClick={() => router.push('/maintained', { scroll: false })}
                    >
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
              {/* <div className="bg-gray-100 rounded-full py-2 px-4 text-sm font-semibold tracking-wide">
                <span>View all</span>
              </div> */}
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
                  {issues.map((issue) => {
                    // Determine severity color for right border
                    let rightBorderColor = 'border-r-8 border-blue-400';
                    let badgeColor = 'bg-blue-100 text-blue-800';
                    if (issue.severity?.toLowerCase() === 'high') {
                      rightBorderColor = 'border-r-8 border-red-500';
                      badgeColor = 'bg-red-100 text-red-800';
                    } else if (issue.severity?.toLowerCase() === 'medium') {
                      rightBorderColor = 'border-r-8 border-yellow-400';
                      badgeColor = 'bg-yellow-100 text-yellow-800';
                    }
                    // Format date
                    const dateStr = issue.reported_at ? new Date(issue.reported_at).toLocaleDateString() : '';
                    return (
                      <div
                        key={issue.event_id}
                        className={`flex flex-col gap-2 rounded-2xl bg-white border border-l border-t border-b border-gray-200 p-4 border-r-8 ${rightBorderColor} cursor-pointer transition-shadow hover:shadow-lg transition-transform duration-150 ease-out active:scale-95`}
                        onClick={() => router.push(`/issue/${issue.event_id}`, { scroll: false })}
                        tabIndex={0}
                        role="button"
                        aria-label={`View details for ${issue.name || 'issue'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-base text-gray-600 truncate max-w-[70%]">
                            {issue.name || 'Untitled Issue'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeColor}`}>{issue.severity ? issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1) : 'Unknown'}</span>
                        </div>
                        <p className="text-gray-500 text-sm truncate max-w-full">
                          {issue.description || 'No description provided.'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-300">Reported:</span>
                          <span className="text-xs text-gray-400">{dateStr}</span>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* <div className="rounded-2xl p-8 bg-[#97B9FF] text-white mb-10 border border-blue-300">
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
          </div> */}
        </main>
      </div>
    </div>
  );
}