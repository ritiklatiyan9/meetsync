import React, { useEffect, useRef, useState } from 'react';
import { FlipText } from "../components/magicui/flip-text";
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Star, Zap, Shield, Video, Users, Clock, ChevronDown   } from 'lucide-react';
import { SpinningText } from "../components/magicui/spinning-text";
import { InteractiveHoverButton } from "../components/magicui/interactive-hover-button";
import LocomotiveScroll from 'locomotive-scroll';
import 'locomotive-scroll/dist/locomotive-scroll.css';
import { SparklesText } from "../components/magicui/sparkles-text";
import pic from '../assets/pic.png';

import { PointerWrapper } from "../components/magicui/pointer";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { WarpBackground } from "../components/magicui/warp-background";

function Home() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const locomotiveScroll = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const checkMobile = () => window.innerWidth < 768;
    setIsMobile(checkMobile());

    const handleResize = () => {
      const wasMobile = isMobile;
      const isNowMobile = checkMobile();
      if (wasMobile !== isNowMobile) {
        setIsMobile(isNowMobile);
        if (locomotiveScroll.current) {
          locomotiveScroll.current.destroy();
          locomotiveScroll.current = null;
        }
        if (!isNowMobile) initLocomotiveScroll();
      }
    };

    if (!checkMobile()) initLocomotiveScroll();

    const handleScroll = () => {
      if (!scrollRef.current) return;
      const scrollPos = window.scrollY;
      const winHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const totalScroll = docHeight - winHeight;
      const scrolled = Math.min(scrollPos / totalScroll, 1);
      
      setScrollProgress(scrolled);
      setIsScrolling(scrollPos > 50);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      if (locomotiveScroll.current) {
        locomotiveScroll.current.destroy();
      }
    };
  }, [isMobile]);

  const initLocomotiveScroll = () => {
    if (!scrollRef.current) return;

    locomotiveScroll.current = new LocomotiveScroll({
      el: scrollRef.current,
      smooth: true,
      multiplier: 3, // Reduced from 0.8 for smoother scrolling
      class: 'is-inview',
      lerp: 0.08, // Reduced from 0.05 for smoother scrolling
      smartphone: {
        smooth: false,
        breakpoint: 767
      },
      tablet: {
        smooth: true,
        breakpoint: 1024
      }
    });
  };

  const handleGetStarted = () => navigate('/meeting');

  const scrollToFeatures = () => {
    const featuresSection = document.querySelector('#features');
    if (featuresSection) {
      if (locomotiveScroll.current) {
        locomotiveScroll.current.scrollTo(featuresSection);
      } else {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const FeatureCard = ({ icon: Icon, title, description, speed }) => (
    <div 
      className="relative group"
      data-scroll={!isMobile ? true : undefined}
      data-scroll-speed={!isMobile ? speed : undefined}
    >
      <div className="relative p-6 md:p-8 bg-white/5 hover:bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 transition-all duration-500 ease-out hover:scale-[1.02] overflow-hidden">
      <div className="absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 blur-lg"></div>

        <Icon className="w-10 h-10 md:w-12 md:h-12 mb-4 md:mb-6 text-purple-400 transition-transform group-hover:scale-110 group-hover:text-blue-400" />
        <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">{title}</h3>
        <p className="text-sm md:text-base text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );

  const StatsCard = ({ icon: Icon, title, value, speed }) => (
    <div 
      className="relative group overflow-hidden"
      data-scroll={!isMobile ? true : undefined}
      data-scroll-speed={!isMobile ? speed : undefined}
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur"></div>
      <div className="relative p-6 md:p-8 bg-white/5 hover:bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 transition-all duration-500 ease-out hover:scale-[1.02]">
        <Icon className="w-8 h-8 md:w-10 md:h-10 mb-4 text-blue-400 group-hover:text-purple-400 transition-colors duration-300" />
        <div className="text-3xl md:text-4xl font-bold mb-2">{value}</div>
        <div className="text-sm md:text-base text-gray-400">{title}</div>
      </div>
    </div>
  );

  return (
    <>
      {/* Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 z-50 transition-all duration-300" 
        style={{ width: `${scrollProgress * 100}%` }}
      />

      <main ref={scrollRef} data-scroll-container className="bg-black text-white overflow-hidden">
        {/* Hero Section */}
        <section className="min-h-screen relative flex items-center justify-center p-4 md:p-8" data-scroll-section>
          <WarpBackground
            className="absolute opacity-15 inset-0 z-0"
            colors={["#3b82f6", "#8b5cf6"]}
            backgroundOpacity={0.1}
            speed={0.5}
            blur={2}
          />
          <div 
            className="absolute w-64 h-64 md:w-96 md:h-96 bg-blue-500/20 rounded-full blur-3xl -top-32 -left-32 md:-top-48 md:-left-48 animate-pulse"
            data-scroll
            data-scroll-speed="1" // Reduced from 2 for smoother scrolling
            data-scroll-direction="horizontal"
          />
          <div 
            className="absolute w-64 h-64 md:w-96 md:h-96 bg-purple-500/20 rounded-full blur-3xl -bottom-32 -right-32 md:-bottom-48 md:-right-48 animate-pulse delay-700"
            data-scroll
            data-scroll-speed="0.8" // Reduced from 1.5 for smoother scrolling
            data-scroll-direction="horizontal"
          />
          <div className="relative z-10 max-w-5xl mx-auto text-center">
            <div 
              className="inline-flex items-center px-4 py-2 md:px-6 md:py-3 mb-8 md:mb-12 rounded-full border border-white/20 bg-white/10 backdrop-blur-xl hover:bg-white/15 transition-all duration-300"
              data-scroll
              data-scroll-speed="0.3" // Reduced from 0.5 for smoother scrolling
            >
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 text-blue-400 animate-pulse" />
              <span className="text-sm md:text-base font-medium">AI-Powered Meetings</span>
            </div>
            <h1 
              className="text-5xl ml-12 flex md:text-7xl lg:text-8xl font-bold mb-6 md:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-400 to-purple-400"
              data-scroll
              data-scroll-speed="0.1" // Reduced from 0.2 for smoother scrolling
            >
              MeetSync  <span> <SparklesText className='text-white  text-5xl ml-2 md:ml-4 md:text-8xl' text="AI" /></span>
            </h1>
            <p 
              className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed"
              data-scroll
              data-scroll-speed="0.4" // Reduced from 0.7 for smoother scrolling
            >
              Transform your meetings with AI-powered insights and seamless collaboration
            </p>
            <div className="space-y-4 md:space-y-0 md:flex md:items-center md:justify-center md:space-x-4">
              <InteractiveHoverButton 
                className="text-black shadow-xs shadow-slate-100 text-sm md:text-base w-full md:w-auto"
                onClick={handleGetStarted}
                data-scroll
                data-scroll-speed="0.5" // Reduced from 0.8 for smoother scrolling
              >
                Get Started
              </InteractiveHoverButton>
              <Button 
                onClick={scrollToFeatures}
                variant="outline" 
                className="w-full md:w-auto border-white/20 bg-white/5 hover:bg-white/10 hover:text-white backdrop-blur-md"
                data-scroll
                data-scroll-speed="0.5" // Reduced from 0.8 for smoother scrolling
              >
                Learn More
                <ChevronDown className="ml-2 h-4 w-4 animate-bounce" />
              </Button>
            </div>
          </div>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            <div className="w-5 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
              <div className="w-1 h-3 bg-white rounded-full animate-[scroll_1.5s_infinite]"></div>
            </div>
            <p className="mt-2 text-xs font-light text-white/50">Scroll to explore</p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 md:py-32 relative" data-scroll-section>
          <div className="max-w-6xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            <StatsCard 
              icon={Users} 
              title="Active Users" 
              value="50+" 
              speed="0.1" // Reduced from 0.2 for smoother scrolling
            />
            <StatsCard 
              icon={Video} 
              title="Meetings Hosted" 
              value="200+" 
              speed="0.15" // Reduced from 0.3 for smoother scrolling
            />
            <StatsCard 
              icon={Clock} 
              title="Hours Saved" 
              value="20+" 
              speed="0.2" // Reduced from 0.4 for smoother scrolling
            />
          </div>
        </section>

        {/* Features Section */}
        <PointerWrapper>
        <section id="features" className="py-16 md:py-10 relative border-t-2 " data-scroll-section>
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 rounded-full bg-white/10 text-sm text-blue-400 font-medium mb-4">WHAT WE OFFER</span>
              <SparklesText className='m-4' text="Powerful Features" />
              <p className="max-w-2xl mx-auto text-gray-400 text-lg">Our AI-powered platform enhances your meeting experience with cutting-edge tools</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <FeatureCard
                icon={Shield}
                title="Secure Platform"
                description="Enterprise-grade security with end-to-end encryption for all your confidential meetings and data"
                speed="0.25" // Reduced from 0.5 for smoother scrolling
              />
              <FeatureCard
                icon={Clock}
                title="Time Management"
                description="Keep meetings on track with intelligent time allocation and agenda monitoring features"
                speed="0.2" // Reduced from 0.4 for smoother scrolling
              />
              <FeatureCard
                icon={Video}
                title="HD Video Conferencing"
                description="Crystal clear audio and video with adaptive streaming technology for any connection"
                speed="0.3" // Reduced from 0.6 for smoother scrolling
              />
            </div>
          </div>
        </section>
        </PointerWrapper>

        {/* Demo Section */}
        <section id="demo" className="min-h-screen relative flex items-center" data-scroll-section>
          <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/10 to-black opacity-30"></div>
          <div className="max-w-6xl mx-auto px-4 md:px-8 w-full py-12 md:py-24 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
              <div 
                className="space-y-6 md:space-y-8"
                data-scroll
                data-scroll-speed="0.4" // Reduced from 0.8 for smoother scrolling
              >
                <span className="inline-block px-4 py-1 rounded-full bg-white/10 text-sm text-blue-400 font-medium">SEE IT IN ACTION</span>
               
                <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                  Watch how MeetSync AI transforms your meetings into productive, actionable insights with just a few clicks.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mt-1">
                      <span className="text-xs">1</span>
                    </div>
                    <p className="ml-3 text-gray-300">Setup your meeting in seconds</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mt-1">
                      <span className="text-xs">2</span>
                    </div>
                    <p className="ml-3 text-gray-300">Invite participants easily</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mt-1">
                      <span className="text-xs">3</span>
                    </div>
                    <p className="ml-3 text-gray-300">Get AI-powered insights during and after</p>
                  </li>
                </ul>
                <Button 
                  onClick={handleGetStarted}
                  className="mt-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg px-6 py-3 text-base font-medium transition-all duration-300"
                >
                  Try it Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div 
                className="relative aspect-video group"
                data-scroll
                data-scroll-speed="0.4" // Reduced from 0.8 for smoother scrolling
              >
               <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500/30 rounded-3xl blur-xs opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
<div className="relative h-full rounded-2xl md:rounded-3xl bg-black/50 border border-white/10 backdrop-blur-lg overflow-hidden transition-all duration-500 hover:scale-[0.98]">
  <img src={pic} alt="" className="w-full h-full object-cover" />
</div>
 </div>
            </div>
          </div>
        </section>

        {/* Footer placeholder - you may want to add a proper footer here */}
       
      </main>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateY(0); }
          50% { transform: translateY(5px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

export default Home;