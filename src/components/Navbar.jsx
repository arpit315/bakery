import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LogOut, Settings, Package, ChevronDown, Search, Sun, Moon } from 'lucide-react';
import { useCart } from '@/context/CartContext.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const { totalItems } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const userMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Cart', path: '/cart' },
    { name: 'Orders', path: '/orders' },
  ];

  const isActive = (path) => location.pathname === path;

  // Scroll detection for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Check for dark mode
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-500 ${isScrolled
            ? 'glass shadow-lg py-2'
            : 'bg-card/80 backdrop-blur-sm py-3'
          }`}
      >
        <div className="container mx-auto px-4">
          <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-14' : 'h-16 md:h-20'}`}>
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <span className={`font-display font-bold text-primary transition-all duration-300 ${isScrolled ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'}`}>
                BakeryHub
              </span>
              <span className={`transition-all duration-300 group-hover:animate-bounce ${isScrolled ? 'text-xl' : 'text-2xl'}`}>🍰</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-full font-medium transition-all duration-300 ${isActive(link.path)
                      ? 'text-primary bg-primary/10'
                      : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
                    }`}
                >
                  {link.name}
                  {isActive(link.path) && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`p-2.5 rounded-full transition-all duration-300 ${showSearch ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-full hover:bg-muted transition-all duration-300 relative overflow-hidden"
              >
                <Sun className={`w-5 h-5 absolute transition-all duration-500 ${isDark ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`} />
                <Moon className={`w-5 h-5 transition-all duration-500 ${isDark ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`} />
              </button>

              {/* Cart Icon */}
              <Link to="/cart" className="relative p-2.5 hover:bg-muted rounded-full transition-all duration-300 group">
                <ShoppingCart className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
                {totalItems > 0 && (
                  <span className="badge-cart">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Auth Section - Desktop */}
              <div className="hidden md:flex items-center gap-2">
                {isAuthenticated ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 ${showUserMenu ? 'bg-primary/10' : 'hover:bg-muted'}`}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-golden rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-sm font-bold text-white">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-foreground max-w-[100px] truncate">
                        {user?.name?.split(' ')[0]}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {/* User Dropdown Menu */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-56 glass rounded-2xl shadow-xl border border-border/50 py-2 animate-scale-in origin-top-right">
                        <div className="px-4 py-3 border-b border-border/50">
                          <p className="font-medium text-foreground truncate">{user?.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                        </div>

                        <div className="py-1">
                          <Link
                            to="/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors"
                          >
                            <Settings className="w-4 h-4 text-muted-foreground" />
                            <span>My Profile</span>
                          </Link>

                          <Link
                            to="/orders"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors"
                          >
                            <Package className="w-4 h-4 text-muted-foreground" />
                            <span>My Orders</span>
                          </Link>

                          {isAdmin && (
                            <Link
                              to="/admin"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-primary"
                            >
                              <User className="w-4 h-4" />
                              <span>Admin Dashboard</span>
                            </Link>
                          )}
                        </div>

                        <div className="border-t border-border/50 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-destructive/10 transition-colors w-full text-left text-destructive"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="ghost" className="rounded-full hover:bg-muted">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button className="rounded-full bg-primary hover:bg-primary/90 shadow-soft hover:shadow-hover transition-all duration-300">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2.5 hover:bg-muted rounded-full transition-all duration-300"
              >
                <div className="relative w-6 h-6">
                  <span className={`absolute left-0 top-1 w-6 h-0.5 bg-foreground transition-all duration-300 ${isOpen ? 'rotate-45 top-3' : ''}`} />
                  <span className={`absolute left-0 top-3 w-6 h-0.5 bg-foreground transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
                  <span className={`absolute left-0 top-5 w-6 h-0.5 bg-foreground transition-all duration-300 ${isOpen ? '-rotate-45 top-3' : ''}`} />
                </div>
              </button>
            </div>
          </div>

          {/* Search Bar (Expandable) */}
          <div className={`overflow-hidden transition-all duration-500 ${showSearch ? 'max-h-20 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
            <form onSubmit={handleSearch} className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for cakes, pastries, breads..."
                className="w-full px-5 py-3 rounded-full bg-muted border-2 border-transparent focus:border-primary focus:outline-none transition-all duration-300"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="container mx-auto px-4 py-4 border-t border-border/50">
            <div className="flex flex-col gap-1">
              {navLinks.map((link, index) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${isActive(link.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                    }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {link.name}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <div className="border-t border-border/50 my-2 pt-2">
                    <div className="px-4 py-2 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-golden rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user?.name}</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3 rounded-xl font-medium hover:bg-muted flex items-center gap-3"
                  >
                    <Settings className="w-4 h-4" />
                    My Profile
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-3 rounded-xl font-medium hover:bg-muted flex items-center gap-3 text-primary"
                    >
                      <User className="w-4 h-4" />
                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="px-4 py-3 rounded-xl font-medium hover:bg-destructive/10 flex items-center gap-3 text-destructive w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="border-t border-border/50 my-2 pt-2 flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3 rounded-xl font-medium hover:bg-muted text-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3 rounded-xl font-medium bg-primary text-primary-foreground text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
