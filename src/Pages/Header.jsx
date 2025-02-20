import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Calendar, MessageCircle, Home, Menu, X, ChevronRight, Settings, LayoutDashboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGoogleSignIn = () => {
    console.log("Initiating Google Sign-In");
  };

  const navigationItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/meeting", icon: Calendar, label: "Meeting" },
    { to: "/contact", icon: MessageCircle, label: "Contact" },
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/settings", icon: Settings, label: "Settings" }
  ];

  const SignInDialog = () => (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gray-800">
            Welcome Back
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-6">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-2">
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-center text-gray-600 max-w-sm">
            Continue to your workspace
          </p>
          <Button 
            onClick={handleGoogleSignIn}
            className="w-full max-w-sm flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow hover:shadow-md transition-all duration-300 group h-12"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/20 backdrop-blur-md border-b border-gray-100' 
          : 'bg-white/10 backdrop-blur-sm'
      }`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo / Brand */}
            <div className="flex items-center">
              <Link 
                to="/" 
                className="flex items-center gap-2 relative group"
              >
                <Calendar className="w-6 h-6 text-blue-500 group-hover:text-blue-600 transition-colors" />
                <span className="text-lg font-semibold text-gray-200 group-hover:text-gray-900 transition-colors">
                  MeetSync AI
                </span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex md:items-center md:gap-2">
              {navigationItems.slice(0, 3).map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="px-3 py-2 text-sm font-medium text-gray-200 hover:text-gray-900 hover:bg-gray-50/80 rounded-full transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </span>
                </Link>
              ))}
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="ml-4 bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
              >
                Sign In
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(true)}
                className="text-gray-700 hover:text-gray-900"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-[300px] sm:w-[340px] p-0">
          <SheetHeader className="p-6 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-500" />
              <span className="text-gray-800">MeetSync Menu</span>
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col py-2">
            {navigationItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-6 py-3 text-base text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
            <div className="p-6 mt-2 border-t">
              <Button 
                onClick={() => {
                  setIsOpen(false);
                  setIsDialogOpen(true);
                }}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
              >
                Sign In
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <SignInDialog />
    </>
  );
}

export default Header;