import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import Hls from 'hls.js';
import HlsVideo from './components/HlsVideo';

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

function App() {
  const [isVideoReady, setVideoReady] = useState(false);
  const [isPageLoaded, setPageLoaded] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const zoomHeroRef = useRef<HTMLDivElement>(null);
  const zoomImageRef = useRef<HTMLImageElement>(null);
  const hlsVideoRef = useRef<HTMLVideoElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const hazeRef = useRef<HTMLDivElement>(null);
  const windowOverlayRef = useRef<HTMLDivElement>(null);
  
  // Horizontal Scroll Refs
  const horizontalRef = useRef<HTMLDivElement>(null);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);

  // Page Load State
  useEffect(() => {
      const onPageLoad = () => setPageLoaded(true);
      if (document.readyState === 'complete') {
          onPageLoad();
      } else {
          window.addEventListener('load', onPageLoad);
          return () => window.removeEventListener('load', onPageLoad);
      }
  }, []);

  // Trigger Intro Animation when Assets Ready
  useEffect(() => {
      if (isVideoReady && isPageLoaded && hazeRef.current) {
          gsap.to(hazeRef.current, { 
              opacity: 0, 
              duration: 4, 
              ease: "power2.inOut",
              delay: 0.5 // Slight pause before reveal
          });
      }
  }, [isVideoReady, isPageLoaded]);

  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      touchMultiplier: 2,
    });

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Initialize HLS Video
    if (Hls.isSupported() && hlsVideoRef.current) {
        const hls = new Hls();
        hls.loadSource('https://stream.mux.com/lf67zD006rJtxD75pU005vb5FMzlGpCl39h4vcno3jV014.m3u8');
        hls.attachMedia(hlsVideoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
             // Optional: videoRef.current.play(); 
             // Auto-play is handled by the video attribute usually, but good to have ready.
        });
    } else if (hlsVideoRef.current && hlsVideoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        hlsVideoRef.current.src = 'https://stream.mux.com/lf67zD006rJtxD75pU005vb5FMzlGpCl39h4vcno3jV014.m3u8';
    }

    // GSAP Context
    const ctx = gsap.context(() => {
      
      // Zoom Hero Animation
      const tl = gsap.timeline({
        scrollTrigger: {
            trigger: zoomHeroRef.current,
            start: "top top",
            end: "+=10000", // Increased pin distance for sequential reading
            pin: true,
            scrub: 1,
        }
      });

      // 1. Fade out scroll indicator
      tl.to(scrollIndicatorRef.current, { opacity: 0, duration: 0.5 }, 0)
        .to(windowOverlayRef.current, { scale: 2, opacity: 0, filter: "blur(20px)", duration: 2, ease: "power2.inOut" }, 0) // Blur window overlay
        .to(zoomImageRef.current, { scale: 50, filter: "blur(30px)", ease: "power2.inOut", transformOrigin: "center center", duration: 3 }, 0) // Blur window frame
        .to(zoomImageRef.current, { opacity: 0, duration: 0.5 }, ">-0.5");

      // 3. Text Fly-Through Sequence
      const texts = gsap.utils.toArray('.fly-text');
      
      texts.forEach((text: any, i) => {
        tl.fromTo(text, 
          { scale: 0.5, opacity: 0, filter: 'blur(10px)' },
          { 
            keyframes: [
                { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.5, ease: "power2.out" },   // Float in to readable size
                { opacity: 0, scale: 3, filter: 'blur(20px)', duration: 1, ease: "power2.in" }     // Fly past/fade out
            ],
                        duration: 3, // Total duration for one phrase
                      },
                      i === 0 ? ">" : ">-0.5" // Start immediately after foreground is gone
                    );      });

      // Grid Item Animations (Existing)
      const items = gsap.utils.toArray('.masonry-item');
      items.forEach((item: any) => {
        gsap.fromTo(item,
          { opacity: 0, y: 100 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 100%", 
              end: "top 80%",
              toggleActions: "play none none reverse"
            }
          }
        );
      });

      // Title Parallax (Existing)
      gsap.to(".main-title", {
        yPercent: -50,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
            trigger: ".header-section",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
      });

      // --- Horizontal Scroll Logic ---
      const track = horizontalTrackRef.current;
      const container = horizontalRef.current;
      
      if (track && container) {
          const scrollLength = track.scrollWidth - window.innerWidth;

          // Pin and Scroll
          const horizontalTl = gsap.timeline({
              scrollTrigger: {
                  trigger: container,
                  start: "top top",
                  end: () => `+=${scrollLength}`,
                  pin: true,
                  scrub: 1,
                  invalidateOnRefresh: true,
              }
          });

          horizontalTl.to(track, {
              x: -scrollLength,
              ease: "none"
          });

          // Background Color Changes
          ScrollTrigger.create({
              trigger: container,
              start: "top top",
              end: () => `+=${scrollLength}`,
              scrub: true,
              onUpdate: (self) => {
                  const progress = self.progress;
                  if (progress < 0.1) {
                      gsap.to(wrapperRef.current, { backgroundColor: '#1a1a1a', overwrite: 'auto' });
                  } else if (progress >= 0.1 && progress < 0.4) {
                      gsap.to(wrapperRef.current, { backgroundColor: '#263341', overwrite: 'auto' }); // Adventure Blue-Grey
                  } else if (progress >= 0.4 && progress < 0.8) {
                      gsap.to(wrapperRef.current, { backgroundColor: '#3e2723', overwrite: 'auto' }); // Romance Warm Brown
                  } else {
                      gsap.to(wrapperRef.current, { backgroundColor: '#1a1a1a', overwrite: 'auto' });
                  }
              }
          });
      }

    }, wrapperRef);

    return () => {
      lenis.destroy();
      ctx.revert();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  const items = [
    { 
      type: 'text', 
      title: "The Beginning", 
      content: "A collection of moments frozen in time.", 
      className: "col-span-1 aspect-square md:aspect-auto flex flex-col justify-center items-center text-center p-8 border border-white/10 rounded-xl" 
    },
    { 
      type: 'video', 
      src: "https://stream.mux.com/OvXUe66SLFMW600ZllVZ2yM6GKzjFdguc02gTL5gEe65Q.m3u8", 
      label: "Timeless", 
      className: "col-span-1 md:col-span-2 aspect-video" 
    },
    { 
      type: 'video', 
      src: "https://stream.mux.com/xOt4Vao9xxkMnPVCkC71P2d3GKfDPwuTBWLXddPn7So.m3u8", 
      label: "Aurora", 
      className: "col-span-1 row-span-1 md:row-span-2 aspect-[9/16]" 
    },
    { 
      type: 'video', 
      src: "https://stream.mux.com/oSMXNJvzIhPSQTZmXI4CTO5qG1GBBO2mCH5Ddm9TSoo.m3u8", 
      label: "Arrival", 
      className: "col-span-1 md:col-span-2 aspect-video" 
    },
    { 
      type: 'text', 
      title: "Silence", 
      content: "In the quiet of the highlands, the world speaks.", 
      className: "col-span-1 aspect-square md:aspect-auto flex flex-col justify-center items-center text-center p-8 bg-[#222] rounded-xl" 
    },
    { 
      type: 'video', 
      src: "https://stream.mux.com/xOt4Vao9xxkMnPVCkC71P2d3GKfDPwuTBWLXddPn7So.m3u8", 
      label: "Stillness", 
      className: "col-span-1 row-span-1 md:row-span-2 aspect-[9/16]" 
    },
    { 
      type: 'video', 
      src: "https://stream.mux.com/OpKxMRF7H5xm01gk00aJW00H01qIio4Hd9IfibLa00EWcTL8.m3u8", 
      label: "Horizons", 
      className: "col-span-1 md:col-span-2 aspect-video" 
    },
    { 
      type: 'text', 
      title: "Light", 
      content: "Chasing the midnight sun across the lava fields.", 
      className: "col-span-1 aspect-square md:aspect-auto flex flex-col justify-center items-center text-center p-8 bg-[#2a2a2a] rounded-xl" 
    },
    { 
      type: 'video', 
      src: "https://stream.mux.com/cv7i3VA56GSMmD00sYLZkGoamknBPCDvUhF02wQ7R7IzA.m3u8", 
      label: "Journey", 
      className: "col-span-1 md:col-span-2 aspect-video" 
    },
  ];

  const flyTexts = [
      { 
          lines: ["WELCOME TO", "THE HIDDEN WORLD"], 
          className: "justify-center items-center text-center" 
      },
      { 
          lines: ["WHERE TIME", "STANDS STILL"], 
          className: "justify-start items-start pt-[20vh] pl-[5vw] text-left" 
      },
      { 
          lines: ["BREATHE", "THE WILD"], 
          className: "justify-end items-end pb-[20vh] pr-[5vw] text-right" 
      },
      { 
          lines: ["LET'S BEGIN", "YOUR JOURNEY"], 
          className: "justify-center items-center text-center" 
      }
  ];

  // Horizontal Assets
  const adventureImages = [1, 2, 3, 4].map(n => `/assets/horizontal/adventure-${n}.jpg`);
  const romanceImages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `/assets/horizontal/romance-${n}.jpg`);
  const finaleImages = [1, 2].map(n => `/assets/horizontal/finale-${n}.jpg`);

  return (
    <div className="bg-cottage-dark text-cottage-light font-sans min-h-screen selection:bg-white selection:text-black transition-colors duration-700 ease-out" ref={wrapperRef}>
      
      {/* Zoom Hero Section */}
      <section ref={zoomHeroRef} className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-black z-50">
          
          {/* Background Video (Revealed through the hole) */}
          <video 
              ref={hlsVideoRef}
              className="absolute inset-0 w-full h-full object-cover z-0"
              autoPlay 
              muted 
              loop 
              playsInline
              onCanPlay={() => setVideoReady(true)}
              // src is handled by HLS.js or native logic
          />

          {/* Airplane Window Effect Overlay */}
          <div 
            ref={windowOverlayRef} 
            className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.3)_80%,rgba(0,0,0,0.8)_100%)] shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" 
          />

          {/* Loading Cloud Overlay */}
          <div ref={hazeRef} className="absolute inset-0 bg-white z-20 pointer-events-none flex items-center justify-center">
              <span className="text-black/20 font-serif tracking-[0.5em] text-xs md:text-sm animate-pulse">LOADING</span>
          </div>

          {/* Foreground Image (The one with the transparent hole) */}
          <div className="absolute inset-0 z-30 flex items-center justify-center overflow-hidden pointer-events-none">
             <img 
                ref={zoomImageRef}
                src="/flying-transparent.png" 
                alt="Window to the wild" 
                className="min-w-full min-h-full object-cover w-full h-full"
                // Starting scale is 1, managed by GSAP
             />
          </div>

          {/* Text Fly-Through Elements */}
          {flyTexts.map((item, i) => (
             <div key={i} className={`fly-text absolute inset-0 z-40 pointer-events-none text-white opacity-0 w-full h-full p-6 flex flex-col gap-4 ${item.className}`}>
                {item.lines.map((line, j) => (
                    <h2 key={j} className="text-3xl md:text-6xl font-serif italic font-light tracking-[0.2em] drop-shadow-2xl leading-tight">
                        {line}
                    </h2>
                ))}
             </div>
          ))}
          
           <div ref={scrollIndicatorRef} className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce text-white mix-blend-difference">
            <span className="text-[10px] uppercase tracking-widest mb-2 block text-center">Scroll to Enter</span>
            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7" />
            </svg>
           </div>
      </section>

      {/* Header / Title Section */}
      <header className="header-section relative w-full h-[70vh] flex flex-col items-center justify-center z-10 sticky top-0 pointer-events-none">
        <div className="main-title text-center">
            <h1 className="text-7xl md:text-[10rem] font-serif tracking-tighter text-white mb-2 leading-none mix-blend-difference">
            HIDDEN
            </h1>
            <p className="text-sm md:text-lg tracking-[0.5em] uppercase font-light text-gray-400 mix-blend-difference">
            Icelandic Sanctuary
            </p>
        </div>
      </header>

      {/* Artistic Grid Section */}
      <section ref={galleryRef} className="relative z-20 px-4 md:px-8 pb-32 w-full max-w-[1920px] mx-auto mt-[10vh] bg-gradient-to-b from-transparent to-cottage-dark">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
                    {items.map((item, index) => {
          
                       if (item.type === 'video') {
          
                           return (
          
                              <div key={index} className={`masonry-item relative rounded-xl overflow-hidden shadow-2xl bg-gray-900 group cursor-pointer ${item.className}`}>
          
                                                          <HlsVideo 
          
                                                              className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-110" 
          
                                                              autoPlay 
          
                                                              muted 
          
                                                              loop 
          
                                                              playsInline 
          
                                                              src={item.src!} 
          
                                                          />
          
                                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
          
                                  <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          
                                      <span className="text-white text-sm tracking-widest uppercase font-bold drop-shadow-md">{item.label}</span>
          
                                  </div>
          
                              </div>
          
                           );
          
                       } else {
                 return (
                    <div key={index} className={`masonry-item shadow-xl backdrop-blur-sm ${item.className}`}>
                        <h3 className="font-serif text-2xl md:text-3xl italic text-white/90 mb-2">{item.title}</h3>
                        {item.content && <p className="text-gray-400 text-sm leading-relaxed max-w-[80%]">{item.content}</p>}
                    </div>
                 );
             }
          })}

        </div>
      </section>

      {/* Horizontal Scroll Section */}
      <section ref={horizontalRef} className="relative h-screen overflow-hidden flex items-center z-30">
         <div ref={horizontalTrackRef} className="flex h-[80vh] items-center gap-[5vw] px-[10vw]">
            
            {/* Title Card */}
            <div className="flex-shrink-0 w-[80vw] md:w-[40vw] flex flex-col justify-center">
                <h2 className="text-6xl md:text-8xl font-serif text-white leading-none">
                    Choose<br/>Your Path
                </h2>
                <p className="mt-8 text-xl text-gray-300 max-w-md">
                    Every direction holds a new discovery. Will you seek the thrill of the wild or the warmth of intimacy?
                </p>
            </div>

            {/* Adventure Section */}
            <div className="flex-shrink-0 flex items-center gap-8">
                <div className="w-[20vw] h-full flex items-center justify-center">
                    <h3 className="text-[12vh] md:text-[18vh] leading-none font-serif opacity-10 -rotate-90 whitespace-nowrap text-cyan-100">ADVENTURE</h3>
                </div>
                {adventureImages.map((src, i) => (
                    <div key={`adv-${i}`} className="relative w-[80vw] md:w-[40vw] h-[60vh] md:h-[70vh] flex-shrink-0 rounded-lg overflow-hidden shadow-2xl group">
                        <img src={src} alt="Adventure" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                ))}
                {/* Finale Images Moved Here */}
                {finaleImages.map((src, i) => (
                     <div key={`fin-${i}`} className="relative w-[80vw] md:w-[40vw] h-[60vh] md:h-[70vh] flex-shrink-0 rounded-lg overflow-hidden shadow-2xl group">
                          <img src={src} alt="Finale" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                     </div>
                 ))}
            </div>

            {/* Romance Section */}
            <div className="flex-shrink-0 flex items-center gap-8 pl-20 border-l border-white/10">
                <div className="w-[20vw] h-full flex items-center justify-center">
                    <h3 className="text-[12vh] md:text-[18vh] leading-none font-serif opacity-10 -rotate-90 whitespace-nowrap text-rose-100">ROMANCE</h3>
                </div>
                {romanceImages.map((src, i) => (
                    <div key={`rom-${i}`} className="relative w-[70vw] md:w-[30vw] h-[50vh] md:h-[60vh] flex-shrink-0 rounded-lg overflow-hidden shadow-2xl group">
                        <img src={src} alt="Romance" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-rose-900/10 mix-blend-overlay group-hover:opacity-0 transition-opacity" />
                    </div>
                ))}
            </div>

             {/* Outro Text */}
             <div className="flex-shrink-0 w-[50vw] flex flex-col justify-center pl-20">
                  <h3 className="text-5xl font-serif mb-4 text-white">Your Story Begins Here.</h3>
             </div>

         </div>
      </section>

      {/* Booking / Footer */}
      <section className="reveal-section min-h-[50vh] flex flex-col items-center justify-center py-20 px-6 bg-cottage-dark border-t border-gray-800/30 relative z-20">
        <h2 className="text-5xl md:text-8xl font-serif text-white mb-12 text-center opacity-90">
          Book<br/>Your Stay
        </h2>
        <a 
          href="https://9a69884.bookingturbo.com/en/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative px-8 py-4 bg-transparent border border-white/30 text-white text-lg tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300 rounded-full overflow-hidden inline-block"
        >
          <span className="relative z-10">Reserve Now</span>
        </a>
        <footer className="mt-32 text-gray-600 text-xs tracking-widest uppercase">
          &copy; {new Date().getFullYear()} Hidden Cottages Iceland
        </footer>
      </section>

    </div>
  );
}

export default App;