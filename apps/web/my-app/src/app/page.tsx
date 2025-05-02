"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { animate } from 'animejs';
import ExamplePage from "@/components/examples/Page/ExamplePage";
import { categories } from '@/data/categories';

const INITIAL_COLLAPSED_HEIGHT = 'h-[4.5rem]';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sheetQuery = searchParams.get('sheet');

  const [infoOpen, setInfoOpen] = useState(false);
  const infoContentRef = useRef<HTMLDivElement>(null);
  const fadeOverlayRef = useRef<HTMLDivElement>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

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
    router.push('/categories', { scroll: false });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-['Schibsted_Grotesk',_Arial,_sans-serif] p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg">
        <main className="flex flex-col gap-12">
          <div>
            <h1 className="text-3xl font-bold leading-tight mb-6">
              Hello, from<br />
              Cluj-Napoca
            </h1>
            
            <div 
              className="relative cursor-pointer"
              onClick={toggleInfo} 
            >
              <div 
                ref={infoContentRef} 
                className={`overflow-hidden relative ${INITIAL_COLLAPSED_HEIGHT} pb-6`} 
              >
                <div className="text-lg font-normal leading-relaxed text-gray-500 tracking-normal py-3 rounded-lg mb-2">
                  <p>Cluj-Napoca is the second most populous city in Romania and the seat of Cluj County. Located in northwestern Romania, the city is situated approximately 450 kilometers from Bucharest.</p>
                  <br />
                  <p>The city is one of the most important academic, cultural, industrial and business centers in Romania. Home to the country's largest university, Babeș-Bolyai University, Cluj is also a major IT and innovation hub in Eastern Europe.</p>
                </div>
              </div>
              <div 
                ref={fadeOverlayRef} 
                className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" 
                style={{ opacity: 1 }}
              ></div>
            </div>
          </div>

          <div className="pb-12">
            <div className="grid grid-cols-2 gap-5">
              <div className="rounded-2xl p-4 bg-[#DBF24C] border border-lime-200">
                <p className="text-3xl font-bold text-lime-900">40</p>
                <p className="text-sm text-lime-800">issues</p>
              </div>
              
              <div className="rounded-2xl p-4 bg-gray-100 border border-gray-200">
                <p className="text-3xl font-bold">5s</p>
                <p className="text-sm text-gray-600">avg response time</p>
              </div>
              
              <div className="rounded-2xl p-4 bg-gray-100 border border-gray-200">
                <p className="text-3xl font-bold">25</p>
                <p className="text-sm text-gray-600">degrees celsius</p>
              </div>
              
              <div className="rounded-2xl p-4 bg-[#FE7A71] border border-red-300">
                <p className="text-3xl font-bold text-white">5</p>
                <p className="text-sm text-red-100">critical problems</p>
              </div>
            </div>
          </div>

          <div className="pb-12">
            <div className="flex justify-between items-center pb-8">
              <h2 className="text-2xl font-semibold">Categories</h2>
              <button 
                onClick={openCategoriesSheet}
                className="bg-gray-100 rounded-full py-2 px-4 text-sm font-semibold tracking-wide hover:bg-gray-200 transition-colors duration-150"
              >
                <span>View all</span>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              {categories.map((category) => (
                <div 
                  key={category.slug} 
                  onClick={() => router.push(`/categories/${category.slug}`)}
                  className={`relative rounded-2xl border border-gray-100 overflow-hidden aspect-square cursor-pointer transition-transform duration-200 ease-out ${hoveredCard === category.slug ? '-translate-y-1' : ''}`}
                  onMouseEnter={() => setHoveredCard(category.slug)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center p-4">
                    <span className="text-gray-400 font-medium text-center">{category.name}</span> 
                  </div>
                </div>
              ))}
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
              <div className="rounded-2xl p-6 bg-[#DBF24C] border border-lime-200">
                <p className="text-lime-900 text-base">"Lorem Ipsum is simply dummy text of the printing and typesetting industry."</p>
              </div>
              
              <div className="rounded-2xl p-6 bg-[#DBF24C] border border-lime-200">
                <p className="text-lime-900 text-base">"Lorem Ipsum is simply dummy text of the printing and typesetting industry."</p>
              </div>
              
              <div className="rounded-2xl p-6 bg-[#DBF24C] border border-lime-200">
                <p className="text-lime-900 text-base">"Lorem Ipsum is simply dummy text of the printing and typesetting industry."</p>
              </div>
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
