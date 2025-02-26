import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MessageCircle,
  Home,
  Menu,
  LogOut,
  Building,
} from "lucide-react"; // Import Building icon for Organization
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from "../context/AuthContext";

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false); // State for profile dropdown
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth(); // Use auth context

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const baseNavigationItems = [
    { to: "/", icon: Home, label: "Home", color: "#4A90E2" }, // Blue
    { to: "/meeting", icon: Calendar, label: "Meeting", color: "#50E3C2" }, // Green
    { to: "/contact", icon: MessageCircle, label: "Contact", color: "#F5A623" }, // Orange
  ];

  const loggedInNavigationItems = [
    ...baseNavigationItems,
    { to: "/org", icon: Building, label: "Organization", color: "#BD10E0" }, // Purple
  ];

  const navigationItems = isLoggedIn
    ? loggedInNavigationItems
    : baseNavigationItems;

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-transform duration-300 ${
          headerVisible ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(200, 200, 200, 0.2)",
        }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 relative group">
                <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
                  <path
                    d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z"
                    fill="url(#paint0_linear_201_5)"
                  />
                  <path
                    d="M19.5 11.5L23 15L19.5 18.5M12.5 11.5L9 15L12.5 18.5M21 22L11 12"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <defs>
                    <linearGradient
                      id="paint0_linear_201_5"
                      x1="16"
                      y1="0"
                      x2="16"
                      y2="32"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#6366F1" />
                      <stop offset="1" stopColor="#4338CA" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="text-lg font-semibold text-gray-200 group-hover:text-gray-200 transition-colors">
                  MeetSync AI
                </span>
              </Link>
            </div>
            {/* Navigation Items */}
            <div className="hidden md:flex md:items-center md:gap-2">
              {navigationItems.slice(0, isLoggedIn ? 4 : 3).map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="px-3 py-2 text-sm font-medium text-gray-200   hover:bg-gray-700/60 hover:text-white rounded-full transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" color={item.color} />{" "}
                    {/* Apply unique color */}
                    {item.label}
                  </span>
                </Link>
              ))}
              {/* Profile Dropdown or Sign-In Button */}
              {isLoggedIn ? (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                    className="text-gray-200 hover:text-gray-900"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                  {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-black/90 border border-purple-500/50 shadow-xl rounded-lg overflow-hidden z-10 backdrop-blur-lg">
                  <div className="p-4 space-y-1">
                    <p className="text-sm font-semibold text-white/90">👤 {user?.name}</p>
                    <p className="text-xs text-white/70">{user?.email}</p>
                  </div>
                  <div className="border-t border-white/10"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-700/90 hover:text-white transition-all duration-300"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
                
                  )}
                </div>
              ) : (
                <Button
                  onClick={() => navigate("/login")}
                  variant="ghost"
                  className="text-gray-200 hover:text-gray-900"
                >
                  Sign-In
                </Button>
              )}
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
      {/* Mobile Navigation Drawer */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-[300px] sm:w-[340px] p-0">
          <SheetHeader className="p-6 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-500" />
              <span className="text-gray-100">MeetSync AI</span>
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col py-2">
            {navigationItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-6 py-3 text-base text-gray-100 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
            <div className="p-6 mt-2 border-t">
              {isLoggedIn ? (
                <Button
                  onClick={handleLogout}
                  className="w-full bg-red-500 hover:bg-red-600 text-white shadow-sm"
                >
                  Logout
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/login");
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default Header;
