"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowRight, User, Menu, Brain, Briefcase, Map } from "lucide-react";

// --- Custom Hook for Scroll Reveal ---
function useReveal(delayMs = 0) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delayMs);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delayMs]);

  return { ref, isVisible };
}

// --- Reveal Wrapper Component ---
function RevealItem({ children, className = "", delay = 0 }: { children?: React.ReactNode, className?: string, delay?: number }) {
  const { ref, isVisible } = useReveal(delay);
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FCFCFC] text-[#1A1A1A] font-sans selection:bg-black selection:text-white overflow-x-hidden relative">
      
      {/* Absolute Side Pagination Indicators */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-6 z-50 mix-blend-difference text-white">
        <div className="w-[1px] h-12 bg-white/20"></div>
        <div className="w-[5px] h-[5px] rounded-full border border-white flex items-center justify-center p-[4px]"><div className="w-[3px] h-[3px] bg-white rounded-full"></div></div>
        <div className="w-[3px] h-[3px] rounded-full bg-white/30"></div>
        <div className="w-[3px] h-[3px] rounded-full bg-white/30"></div>
        <div className="w-[3px] h-[3px] rounded-full bg-white/30"></div>
        <div className="w-[1px] h-12 bg-white/20"></div>
      </div>

      <div className="fixed right-8 top-12 hidden lg:flex items-center gap-4 z-50 text-[10px] tracking-[0.2em] uppercase font-bold text-black/40">
        <span>01</span>
        <div className="flex gap-1">
          <div className="w-1 h-[2px] bg-black"></div>
          <div className="w-1 h-[2px] bg-black/20"></div>
          <div className="w-1 h-[2px] bg-black/20"></div>
        </div>
        <span>03</span>
      </div>

      {/* --- Navbar --- */}
      <nav className="fixed top-0 w-full flex justify-between items-center px-6 lg:px-20 py-8 z-40 bg-[#FCFCFC]/80 backdrop-blur-md">
        <div className="text-sm font-black tracking-widest uppercase">
          Learn_Studio&deg;
        </div>
        <div className="hidden md:flex items-center gap-10 text-[10px] tracking-[0.15em] font-bold uppercase text-black/60">
          <a href="#aptitude" className="hover:text-black transition-colors">Aptitude</a>
          <a href="#placements" className="hover:text-black transition-colors">Placements</a>
          <a href="#roadmaps" className="hover:text-black transition-colors">Roadmaps</a>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="hidden md:block hover:opacity-70 transition-opacity">
            <User size={18} strokeWidth={1.5} />
          </Link>
          <button className="hover:opacity-70 transition-opacity md:hidden">
            <Menu size={20} strokeWidth={1.5} />
          </button>
        </div>
      </nav>

      {/* --- Page Content --- */}
      <main className="pt-32 pb-40 px-6 lg:px-20 max-w-[1600px] mx-auto space-y-32 lg:space-y-64">

        {/* --- SECTION 1: Aptitude (Text Left, Image Right) --- */}
        <section id="aptitude" className="relative flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-0 mt-10 lg:mt-32">
          {/* Text Content */}
          <div className="w-full lg:w-1/2 lg:pr-20 z-10">
            <RevealItem>
              <div className="text-[10px] tracking-[0.2em] font-bold uppercase text-black/50 mb-6 flex items-center gap-4">
                <span className="w-6 h-[1px] bg-black/50"></span>
                Aptitude Engine | 2026
              </div>
            </RevealItem>
            
            <RevealItem delay={150}>
              <h1 className="text-5xl lg:text-7xl xl:text-[85px] leading-[1.05] tracking-tight font-light mb-8">
                Mental<br />
                gymnastics<br />
                elevated.
              </h1>
            </RevealItem>
            
            <RevealItem delay={300}>
              <p className="text-black/50 text-xs md:text-sm font-medium tracking-wide max-w-sm leading-relaxed mb-10">
                Endless 5-minute sprints designed to sharpen raw logical reasoning. Questions appear once, ensuring genuine cognitive growth.
              </p>
            </RevealItem>
            
            <RevealItem delay={450}>
              <div className="flex items-center gap-8">
                <Link href="/login" className="px-10 py-4 border border-black/20 hover:border-black transition-all text-[10px] tracking-[0.2em] font-bold uppercase">
                  Start Sprint
                </Link>
                <div className="flex items-center gap-4 text-black/30 hover:text-black transition-colors cursor-pointer group">
                  <ArrowRight size={24} strokeWidth={1} className="group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </RevealItem>
          </div>

          {/* Geometric Image Showcase */}
          <div className="w-full lg:w-1/2 relative h-[500px] lg:h-[800px] flex items-center justify-center">
            {/* The offset circle background */}
            <RevealItem delay={200} className="absolute w-[80%] h-[80%] lg:w-[600px] lg:h-[600px] rounded-full bg-[#F0F0F0] -z-10 aspect-square" />
            <RevealItem delay={400} className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                <Brain strokeWidth={0.5} className="w-64 h-64 lg:w-96 lg:h-96 text-black/10 scale-110 lg:scale-125 hover:scale-[1.3] transition-transform duration-1000 ease-out" />
            </RevealItem>
            <div className="absolute right-0 top-[20%] text-[10px] hidden lg:block tracking-widest text-black/30 max-w-[120px] text-right">
              This is the Aptitude Sprint.
              Welcome to an icon.
            </div>
            {/* Vertical separating rules similar to the mock */}
            <div className="absolute left-[10%] top-[-10%] h-[120%] w-[1px] bg-black/5 hidden lg:block"></div>
            <div className="absolute right-[20%] top-[-5%] h-[110%] w-[1px] bg-black/5 hidden lg:block"></div>
          </div>
        </section>

        {/* --- SECTION 2: Placements (Image Left, Text Right) --- */}
        <section id="placements" className="relative flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-0 mt-32">
          {/* Geometric Image Showcase */}
          <div className="w-full lg:w-[45%] relative h-[450px] lg:h-[700px] flex items-center justify-center order-2 lg:order-1">
             {/* Large completely offset stark rectangle background */}
            <RevealItem delay={100} className="absolute w-full h-full lg:w-[80%] lg:h-[110%] bg-[#EEEEEE] right-0 top-10 lg:-left-20 -z-10" />
            <RevealItem delay={300} className="w-full h-full relative z-10 flex items-center justify-center pointer-events-none">
                 <Briefcase strokeWidth={0.5} className="w-64 h-64 lg:w-[28rem] lg:h-[28rem] text-black/10 scale-110 lg:scale-[1.3] hover:scale-[1.4] transition-transform duration-1000" />
            </RevealItem>
          </div>

          {/* Text Content */}
          <div className="w-full lg:w-1/2 lg:pl-24 order-1 lg:order-2 z-10">
            <RevealItem>
              <div className="text-[10px] tracking-[0.2em] font-bold uppercase text-black/50 mb-6 flex items-center gap-4">
                Off-Campus Connect
              </div>
            </RevealItem>
            
            <RevealItem delay={150}>
              <h2 className="text-5xl lg:text-7xl xl:text-[85px] leading-[1.05] tracking-tight font-light mb-8">
                Sustainable<br />
                careers.
              </h2>
            </RevealItem>
            
            <RevealItem delay={300}>
              <p className="text-black/50 text-xs md:text-sm font-medium tracking-wide max-w-sm leading-relaxed mb-10">
                A globally sourced, hand-curated selection of internships and fresher roles. Environmentally friendly solution for any work setting. 
              </p>
            </RevealItem>
            
            <RevealItem delay={450}>
              <div className="flex items-center gap-8">
                <Link href="/login" className="px-10 py-4 border border-black/20 hover:border-black transition-all text-[10px] tracking-[0.2em] font-bold uppercase bg-white/50 backdrop-blur-sm">
                  View Placements
                </Link>
                <div className="flex items-center gap-4 text-black/30 hover:text-black transition-colors cursor-pointer group">
                  <ArrowRight size={24} strokeWidth={1} className="group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </RevealItem>
          </div>
        </section>

        {/* --- SECTION 3: Roadmaps (Text Left, Arch Right) --- */}
        <section id="roadmaps" className="relative flex flex-col-reverse lg:flex-row items-end justify-between gap-12 lg:gap-0 mt-32">
          {/* Text Content */}
          <div className="w-full lg:w-[45%] lg:pr-10 z-10 pb-20">
            <RevealItem>
              <div className="text-[10px] tracking-[0.2em] font-bold uppercase text-black/50 mb-6 flex items-center gap-4">
                Interactive Roadmaps
              </div>
            </RevealItem>
            
            <RevealItem delay={150}>
              <h2 className="text-5xl lg:text-7xl xl:text-[85px] leading-[1.05] tracking-tight font-light mb-8">
                Between<br />
                knowing<br />& feeling.
              </h2>
            </RevealItem>
            
            <RevealItem delay={300}>
              <p className="text-black/50 text-xs md:text-sm font-medium tracking-wide max-w-sm leading-relaxed mb-10">
                AI-generated learning pathways customized down to the minute. Updated daily with crisp contextual insights.
              </p>
            </RevealItem>
            
            <RevealItem delay={450}>
              <div className="flex items-center gap-8">
                <Link href="/login" className="px-10 py-4 border border-black/20 hover:border-black transition-all text-[10px] tracking-[0.2em] font-bold uppercase">
                  Explore Paths
                </Link>
                <div className="flex items-center gap-4 text-black/30 hover:text-black transition-colors cursor-pointer group">
                  <ArrowRight size={24} strokeWidth={1} className="group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </RevealItem>
          </div>

          {/* Geometric Image Showcase - Arch */}
          <div className="w-full lg:w-[55%] relative flex justify-center lg:justify-end items-end">
            {/* Minimalist floating tiny image like the reference */}
            <RevealItem delay={600} className="absolute right-[70%] top-[10%] w-32 h-32 rounded-full bg-[#EEEEEE] hidden lg:flex items-center justify-center overflow-hidden pointer-events-none">
               <div className="w-16 h-16 border-2 border-black/10 rounded-[2rem] rotate-12"></div>
            </RevealItem>

            <div className="relative w-[300px] h-[450px] lg:w-[500px] lg:h-[750px] flex items-end justify-center z-10">
              {/* Massive arch backdrop */}
              <RevealItem delay={200} className="absolute bottom-0 w-full h-[85%] bg-[#F0F0F0] rounded-t-[500px] -z-10" />
              
              <RevealItem delay={400} className="relative w-full h-full pb-10 flex items-end justify-center pointer-events-none origin-bottom">
                 <Map strokeWidth={0.5} className="w-64 h-64 lg:w-[28rem] lg:h-[28rem] text-black/10 scale-125 hover:scale-[1.3] transition-transform duration-1000 mb-10 origin-bottom" />
              </RevealItem>
            </div>
            
            <div className="hidden lg:block absolute -right-20 bottom-10 text-[10px] tracking-widest text-black/40">
              <p>Roadmap V2</p>
              <p className="mb-6">GPT-4 Vision • 2026</p>
              <div className="w-12 h-16 border border-black/10 flex items-center justify-center opacity-50">
                <div className="w-6 h-[2px] bg-black"></div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* --- Minimalist Footer --- */}
      <footer className="border-t border-black/10 py-12 px-6 lg:px-20 mt-32 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-black/50">
          &copy; 2026 Learn_Studio&deg;. All rights reserved.
        </div>
        <div className="flex gap-8 text-[10px] uppercase font-bold tracking-[0.2em] text-black/30">
          <a href="#" className="hover:text-black transition-colors">Instagram</a>
          <a href="#" className="hover:text-black transition-colors">Twitter</a>
          <a href="#" className="hover:text-black transition-colors">LinkedIn</a>
        </div>
      </footer>
    </div>
  );
}
