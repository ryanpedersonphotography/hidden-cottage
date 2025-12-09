import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

function App() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

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

    // Gallery Animation
    const ctx = gsap.context(() => {
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
              start: "top 100%", // Start animating when top of item hits bottom of viewport
              end: "top 80%",
              toggleActions: "play none none reverse"
            }
          }
        );
      });

      // Title Parallax
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
      src: "/hero-video.mp4", 
      label: "Timeless", 
      className: "col-span-1 md:col-span-2 aspect-video" 
    },
    { 
      type: 'video', 
      src: "/collage-2.mp4", 
      label: "Aurora", 
      className: "col-span-1 row-span-1 md:row-span-2 aspect-[9/16]" 
    },
    { 
      type: 'video', 
      src: "/flyinto.mp4", 
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
      src: "/collage-3.mp4", 
      label: "Stillness", 
      className: "col-span-1 row-span-1 md:row-span-2 aspect-[9/16]" 
    },
    { 
      type: 'video', 
      src: "/collage-1.mp4", 
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
      src: "/flytowards.mp4", 
      label: "Journey", 
      className: "col-span-1 md:col-span-2 aspect-video" 
    },
  ];

  return (
    <div className="bg-cottage-dark text-cottage-light font-sans min-h-screen selection:bg-white selection:text-black" ref={wrapperRef}>
      
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
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50 mix-blend-difference">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7" />
            </svg>
        </div>
      </header>

      {/* Artistic Grid Section */}
      <section ref={galleryRef} className="relative z-20 px-4 md:px-8 pb-32 w-full max-w-[1920px] mx-auto mt-[40vh] bg-gradient-to-b from-transparent to-cottage-dark">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {items.map((item, index) => {
             if (item.type === 'video') {
                 return (
                    <div 
                        key={index} 
                        className={`masonry-item relative rounded-xl overflow-hidden shadow-2xl bg-gray-900 group cursor-pointer ${item.className}`}
                    >
                        <video 
                            className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-110"
                            autoPlay 
                            muted 
                            loop 
                            playsInline
                            src={item.src}
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

      {/* Booking / Footer */}
      <section className="reveal-section min-h-[50vh] flex flex-col items-center justify-center py-20 px-6 bg-cottage-dark border-t border-gray-800/30 relative z-20">
        <h2 className="text-5xl md:text-8xl font-serif text-white mb-12 text-center opacity-90">
          Book<br/>Your Stay
        </h2>
        <button className="group relative px-8 py-4 bg-transparent border border-white/30 text-white text-lg tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300 rounded-full overflow-hidden">
          <span className="relative z-10">Reserve Now</span>
        </button>
        <footer className="mt-32 text-gray-600 text-xs tracking-widest uppercase">
          &copy; {new Date().getFullYear()} Hidden Cottages Iceland
        </footer>
      </section>

    </div>
  );
}

export default App;