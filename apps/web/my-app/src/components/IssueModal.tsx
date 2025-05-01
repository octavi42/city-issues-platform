// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { useRouter } from 'next/navigation';
// import { animate, waapi } from 'animejs'; // Import waapi alongside animate
// import IssueDetail from "./IssueDetail";

// type StyleObject = {
//   [key: string]: string | number | undefined;
// };

// const styles = {
//   overlay: (isVisible: boolean): StyleObject => ({
//     position: "fixed",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     zIndex: 1000,
//     opacity: 0, // Start invisible
//     pointerEvents: isVisible ? 'auto' : 'none', 
//   }),
//   container: (isVisible: boolean): StyleObject => ({
//     position: "fixed",
//     left: 0,
//     right: 0,
//     bottom: 0,
//     height: "95%",
//     maxHeight: "calc(100vh - 40px)",
//     backgroundColor: "white",
//     color: "black",
//     fontFamily: "'Schibsted Grotesk', Arial, sans-serif",
//     zIndex: 1001,
//     borderTopLeftRadius: "1.875rem",
//     borderTopRightRadius: "1.875rem",
//     transform: "translateY(100%)", // Start off-screen
//     overflowY: "auto",
//     boxShadow: "0 -5px 15px rgba(0,0,0,0.1)"
//   }),
// };

// interface IssueModalProps {
//   issueId: string | null;
//   onClose: () => void;
// }

// const IssueModal: React.FC<IssueModalProps> = ({ issueId, onClose }) => {
//   const [isVisible, setIsVisible] = useState(false);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const overlayRef = useRef<HTMLDivElement>(null);
//   const router = useRouter();
//   const scrollYRef = useRef<number>(0);
//   const originalBodyStyleRef = useRef<Partial<CSSStyleDeclaration> | null>(null);
//   const originalHtmlStyleRef = useRef<Partial<CSSStyleDeclaration> | null>(null);
//   const isAnimating = useRef({ entry: false, exit: false });

//   // Effect to set internal visibility state based on prop
//   useEffect(() => {
//     if (issueId) {
//       if (!isVisible) {
//         const timer = setTimeout(() => setIsVisible(true), 50);
//         return () => clearTimeout(timer);
//       }
//     } else {
//       setIsVisible(false);
//     }
//   }, [issueId, isVisible]);

//   // Effect for animations - Use waapi for container slide
//   useEffect(() => {
//     if (!overlayRef.current || !containerRef.current) return;

//     if (isVisible) {
//       // Entry Animation
//       if (isAnimating.current.entry || isAnimating.current.exit) return;
//       console.log("Anime.js: Running entry animation (WAAPI for slide)");
//       isAnimating.current.entry = true;

//       // Animate overlay opacity (standard animate)
//       animate(
//         overlayRef.current,
//         {
//           opacity: [0, 1],
//           duration: 300,
//           easing: 'easeOutCubic',
//           complete: () => { 
//             if (!isAnimating.current.exit) isAnimating.current.entry = false; 
//             console.log("Anime.js: Overlay entry complete"); 
//           }
//         }
//       );

//       // Animate container slide (using waapi.animate)
//       waapi.animate(
//         containerRef.current,
//         {
//           translateY: ['100%', '0%'],
//           duration: 400,
//           easing: 'ease-out',
//           alternate: true,
//           complete: () => { 
//             if (!isAnimating.current.exit) isAnimating.current.entry = false; 
//             console.log("WAAPI: Container entry complete"); 
//           }
//         }
//       );

//     } else {
//       // Exit Animation
//       if (overlayRef.current && containerRef.current) {
//         if (isAnimating.current.exit || isAnimating.current.entry) return;
//         console.log("Anime.js: Running exit animation (WAAPI for slide)");
//         isAnimating.current.exit = true;

//         // Animate overlay opacity out (standard animate)
//         waapi.animate(
//           overlayRef.current,
//           {
//             opacity: [1, 0],
//             duration: 300,
//             easing: 'ease-in',
//             complete: () => { 
//               if (!isAnimating.current.entry) isAnimating.current.exit = false; 
//               console.log("Anime.js: Overlay exit complete"); 
//             }
//           }
//         );

//         // Animate container slide out (using waapi.animate)
//         waapi.animate(
//           containerRef.current,
//           {
//             translateY: ['0%', '100%'],
//             duration: 400,
//             easing: 'ease-in',
//             alternate: true,
//             complete: () => { 
//               if (!isAnimating.current.entry) isAnimating.current.exit = false; 
//               console.log("WAAPI: Container exit complete"); 
//             }
//           }
//         );
//       }
//     }
//   }, [isVisible]);

//   // Effect for scroll locking (unchanged)
//   useEffect(() => {
//     const body = document.body;
//     const html = document.documentElement;
//     if (isVisible) {
//       scrollYRef.current = window.scrollY;
//       if (!originalBodyStyleRef.current) {
//           originalBodyStyleRef.current = {
//               position: body.style.position,
//               width: body.style.width,
//               top: body.style.top,
//               overflow: body.style.overflow,
//           };
//           originalHtmlStyleRef.current = {
//               overflowY: html.style.overflowY,
//           };
//       }
//       body.style.position = 'fixed';
//       body.style.width = '100%';
//       body.style.top = `-${scrollYRef.current}px`;
//       body.style.overflow = 'hidden';
//       html.style.overflowY = 'scroll';
//     } else {
//         if (originalBodyStyleRef.current) {
//            body.style.position = originalBodyStyleRef.current.position || '';
//            body.style.width = originalBodyStyleRef.current.width || '';
//            body.style.top = originalBodyStyleRef.current.top || '';
//            body.style.overflow = originalBodyStyleRef.current.overflow || '';
//            html.style.overflowY = originalHtmlStyleRef.current?.overflowY || '';
//            window.scrollTo(0, scrollYRef.current);
//             originalBodyStyleRef.current = null;
//             originalHtmlStyleRef.current = null;
//         }
//     }
//     return () => {
//       if (originalBodyStyleRef.current) {
//         body.style.position = originalBodyStyleRef.current.position || '';
//         body.style.width = originalBodyStyleRef.current.width || '';
//         body.style.top = originalBodyStyleRef.current.top || '';
//         body.style.overflow = originalBodyStyleRef.current.overflow || '';
//         html.style.overflowY = originalHtmlStyleRef.current?.overflowY || '';
//         window.scrollTo(0, scrollYRef.current);
//         originalBodyStyleRef.current = null;
//         originalHtmlStyleRef.current = null;
//       }
//     };
//   }, [isVisible]);

//   const handleOverlayClick = () => {
//     // Use isAnimating ref to prevent close during animation
//     if (!isAnimating.current.entry && !isAnimating.current.exit) {
//       router.back();
//     }
//   };

//   return (
//     <>
//       <div
//         ref={overlayRef}
//         style={styles.overlay(isVisible) as React.CSSProperties}
//         onClick={handleOverlayClick}
//         aria-hidden={!isVisible}
//       />
//       <div
//         ref={containerRef}
//         style={styles.container(isVisible) as React.CSSProperties}
//         role="dialog"
//         aria-modal="true"
//         aria-labelledby="issue-modal-title"
//         aria-hidden={!isVisible}
//       >
//         {issueId && <IssueDetail issueId={issueId} />}
//       </div>
//     </>
//   );
// };

// export default IssueModal; 