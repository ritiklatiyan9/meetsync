import React, { useEffect, useRef, useState } from 'react';
import { FlipText } from "../components/magicui/flip-text";
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Star, Zap, Shield, Video, Users, Clock, ChevronDown } from 'lucide-react';
import { SpinningText } from "../components/magicui/spinning-text";
import { InteractiveHoverButton } from "../components/magicui/interactive-hover-button";
import LocomotiveScroll from 'locomotive-scroll';
import 'locomotive-scroll/dist/locomotive-scroll.css';
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
      multiplier: 0.5, // Adjust scroll speed (lower = slower)
      lerp: 0.01, // Smoother interpolation (lower = smoother)
      smartphone: {
        smooth: true, // Enable smooth scrolling on mobile
        breakpoint: 767,
        touchMultiplier: 2.5, // Adjust touch sensitivity on mobile
      },
      tablet: {
        smooth: true,
        breakpoint: 1024,
      },
      reloadOnContextChange: true, // Reload scroll when context changes
      resetNativeScroll: true, // Reset native scroll behavior
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

  const FeatureCard = ({ icon: Icon, title, description }) => (
    <Card className="feature-card">
      <CardContent>
        <Icon size={32} className="mb-4" />
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );

  const StatsCard = ({ icon: Icon, title, value }) => (
    <Card className="stats-card">
      <CardContent>
        <Icon size={32} className="mb-4" />
        <CardTitle>{value}</CardTitle>
        <CardDescription>{title}</CardDescription>
      </CardContent>
    </Card>
  );

  const TestimonialCard = ({ name, role, quote, avatar }) => (
    <Card className="testimonial-card">
      <CardContent>
        <div className="avatar">{name.charAt(0)}</div>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{role}</CardDescription>
        <p className="quote">{quote}</p>
      </CardContent>
    </Card>
  );

  return (
    <div data-scroll-container ref={scrollRef}>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <SpinningText text="AI-Powered Meetings" />
          <h1>MeetSync AI</h1>
          <p>Transform your meetings with AI-powered insights and seamless collaboration</p>
          <div className="hero-buttons">
            <Button onClick={handleGetStarted}>Get Started</Button>
            <Button variant="outline" onClick={scrollToFeatures}>
              Learn More <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
        <div className="scroll-indicator">Scroll to explore</div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="stats-section">
        <StatsCard icon={Users} title="Active Users" value="10K+" />
        <StatsCard icon={Clock} title="Hours Saved" value="500K+" />
        <StatsCard icon={Star} title="Positive Reviews" value="4.9/5" />
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <h2>WHAT WE OFFER</h2>
        <h3>Powerful Features</h3>
        <p>Our AI-powered platform enhances your meeting experience with cutting-edge tools.</p>
        <div className="features-grid">
          <FeatureCard icon={Zap} title="Real-Time Insights" description="Get instant feedback during meetings." />
          <FeatureCard icon={Shield} title="Secure Collaboration" description="End-to-end encrypted communication." />
          <FeatureCard icon={Video} title="HD Video Conferencing" description="Crystal-clear video quality." />
        </div>
      </section>

      {/* Demo Section */}
      <section className="demo-section">
        <h2>SEE IT IN ACTION</h2>
        <h3>MeetSync AI</h3>
        <p>Watch how MeetSync AI transforms your meetings into productive, actionable insights with just a few clicks.</p>
        <div className="demo-steps">
          <div>1. Setup your meeting in seconds</div>
          <div>2. Invite participants easily</div>
          <div>3. Get AI-powered insights during and after</div>
        </div>
        <div className="demo-buttons">
          <Button>Try it Now</Button>
          <Button variant="outline">Live Demo</Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2023 MeetSync AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;