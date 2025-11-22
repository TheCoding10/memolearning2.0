import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const CATEGORIES = [
  { name: "Mathematics", slug: "mathematics" },
  { name: "Computer Science", slug: "computer-science" },
  { name: "Finance & Investing", slug: "finance-investing" },
  { name: "Physics", slug: "physics" },
];

export function AuthNavbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  const handleExplore = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogin = () => {
    navigate("/");
  };

  const handleSignup = () => {
    navigate("/");
  };

  const handleLogoClick = () => {
    navigate("/home");
  };

  const handleCategoryClick = (slug: string) => {
    setIsDropdownOpen(false);
    navigate(`/subject/${slug}`);
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left Section - Explore and Search */}
        <div className="flex items-center gap-6">
          {/* Explore Button with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleExplore}
              className="flex items-center gap-2 text-lg font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Explore
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.slug}
                    onClick={() => handleCategoryClick(category.slug)}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors first:rounded-t-lg last:rounded-b-lg border-b border-gray-100 last:border-b-0 font-medium"
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-4 py-2 w-64">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Center Section - Logo and Branding */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img
            src="/assets/mascot-logo.png"
            alt="MemoLearning Mascot"
            className="h-10 w-10 object-contain"
          />
          <span className="text-lg font-bold text-gray-900">MemoLearning</span>
        </button>

        {/* Right Section - Login and Sign Up */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleLogin}
            className="text-gray-700 font-medium hover:text-gray-900 transition-colors"
          >
            Log in
          </button>
          <button
            onClick={handleSignup}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-6 py-2 rounded-full hover:from-blue-600 hover:to-blue-700 transition-all"
          >
            Sign up
          </button>
        </div>
      </div>
    </nav>
  );
}
