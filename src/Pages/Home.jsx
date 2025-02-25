import React, { useEffect, useRef, useState } from 'react';
import { FlipText } from "../components/magicui/flip-text";
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Star, Zap, Shield, Video, Users, Clock } from 'lucide-react';
import { SpinningText } from "../components/magicui/spinning-text";
import { InteractiveHoverButton } from "../components/magicui/interactive-hover-button";
import LocomotiveScroll from 'locomotive-scroll';
import 'locomotive-scroll/dist/locomotive-scroll.css';

function Home() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const locomotiveScroll = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

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

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (locomotiveScroll.current) {
        locomotiveScroll.current.destroy();
      }
    };
  }, []);

  const initLocomotiveScroll = () => {
    if (!scrollRef.current) return;

    locomotiveScroll.current = new LocomotiveScroll({
      el: scrollRef.current,
      smooth: true,
      multiplier: 0.8,
      class: 'is-inview',
      lerp: 0.05,
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

  const FeatureCard = ({ icon: Icon, title, description, speed }) => (
    <div 
      className="relative group"
      data-scroll={!isMobile ? true : undefined}
      data-scroll-speed={!isMobile ? speed : undefined}
    >
      <div className="relative p-6 md:p-8 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 transition-transform duration-500 ease-out hover:scale-[1.02]">
        <Icon className="w-10 h-10 md:w-12 md:h-12 mb-4 md:mb-6 text-purple-400 transition-transform group-hover:scale-110" />
        <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">{title}</h3>
        <p className="text-sm md:text-base text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );

  const StatsCard = ({ icon: Icon, title, value, speed }) => (
    <div 
      className="relative p-6 md:p-8 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10"
      data-scroll={!isMobile ? true : undefined}
      data-scroll-speed={!isMobile ? speed : undefined}
    >
      <Icon className="w-8 h-8 md:w-10 md:h-10 mb-4 text-blue-400" />
      <div className="text-3xl md:text-4xl font-bold mb-2">{value}</div>
      <div className="text-sm md:text-base text-gray-400">{title}</div>
    </div>
  );

  return (
    <main ref={scrollRef} data-scroll-container className="bg-black text-white overflow-hidden">
      {/* Hero Section */}
      <section className="min-h-screen relative flex items-center justify-center p-4 md:p-8" data-scroll-section>
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute w-64 h-64 md:w-96 md:h-96 bg-blue-500/20 rounded-full blur-xl -top-32 -left-32 md:-top-48 md:-left-48 animate-pulse"
            data-scroll
            data-scroll-speed="2"
            data-scroll-direction="horizontal"
          />
          <div 
            className="absolute w-64 h-64 md:w-96 md:h-96 bg-purple-500/20 rounded-full blur-xl -bottom-32 -right-32 md:-bottom-48 md:-right-48 animate-pulse delay-700"
            data-scroll
            data-scroll-speed="1.5"
            data-scroll-direction="horizontal"
          />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div 
            className="inline-flex items-center px-4 py-2 md:px-6 md:py-3 mb-8 md:mb-12 rounded-full border border-white/20 bg-white/10 backdrop-blur-xl hover:bg-white/15 transition-all duration-300"
            data-scroll
            data-scroll-speed="0.5"
          >
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 text-blue-400 animate-pulse" />
            <span className="text-sm md:text-base font-medium">AI-Powered Meetings</span>
          </div>
          <h1 
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 md:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-400 to-purple-400"
            data-scroll
            data-scroll-speed="0.2"
          >
            MeetSync AI
          </h1>
          <p 
            className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed"
            data-scroll
            data-scroll-speed="0.7"
          >
            Transform your meetings with AI-powered insights and seamless collaboration
          </p>
          <InteractiveHoverButton 
            className="text-black shadow-xs shadow-slate-100 text-sm md:text-base"
            onClick={handleGetStarted}
            data-scroll
            data-scroll-speed="0.8"
          >
            Get Started
          </InteractiveHoverButton>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-32 relative" data-scroll-section>
        <div className="max-w-6xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          <StatsCard 
            icon={Users} 
            title="Active Users" 
            value="50+" 
            speed="0.2" 
          />
          <StatsCard 
            icon={Video} 
            title="Meetings Hosted" 
            value="100+" 
            speed="0.3" 
          />
          <StatsCard 
            icon={Clock} 
            title="Hours Saved" 
            value="50+" 
            speed="0.4" 
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-32 relative" data-scroll-section>
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <FlipText className="text-4xl md:text-7xl mb-8 md:mb-12">Powerful Features</FlipText>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            <FeatureCard
              icon={Star}
              title="Smart Scheduling"
              description="Automatically find the perfect meeting time for all participants"
              speed="0.1"
            />
            <FeatureCard
              icon={Zap}
              title="Real-time Analytics"
              description="Get instant insights and action items from your meetings"
              speed="0.5"
            />
            <FeatureCard
              icon={Shield}
              title="Secure Platform"
              description="Enterprise-grade security for all your confidential meetings"
              speed="0.8"
            />
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="min-h-screen relative flex items-center" data-scroll-section>
        <div className="max-w-6xl mx-auto px-4 md:px-8 w-full py-12 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
            <div 
              className="space-y-6 md:space-y-8"
              data-scroll
              data-scroll-speed="0.8"
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                <SpinningText>SEE IT IN ACTION</SpinningText>
              </h2>
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                Watch how MeetSync AI transforms your meetings into productive, actionable insights.
              </p>
            </div>
            <div 
              className="relative aspect-video group"
              data-scroll
              data-scroll-speed="0.8"
            >
              <div className="relative h-full rounded-2xl md:rounded-3xl bg-black/50 border border-white/10 backdrop-blur-lg overflow-hidden transition-all duration-500 hover:scale-95">
                <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
                  <div className="text-center">
                    <Video className="w-12 h-12 md:w-16 md:h-16 mb-4 md:mb-6 text-purple-400 mx-auto transition-transform group-hover:scale-110" />
                    <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Live Demo</h3>
                    <p className="text-sm md:text-base text-gray-400">Experience the future of AI-powered meetings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="min-h-screen flex items-center justify-center relative" data-scroll-section>
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <div 
            className="relative p-6 md:p-12 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-2xl md:rounded-3xl backdrop-blur-xl border border-white/10"
            data-scroll
            data-scroll-speed="0.3"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8">
              Ready to Transform<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Your Meetings?
              </span>
            </h2>
            <Button 
              onClick={handleGetStarted}
              className="h-12 md:h-16 px-8 md:px-10 text-sm md:text-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 group rounded-lg md:rounded-xl"
              data-scroll
              data-scroll-speed="0.2"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;