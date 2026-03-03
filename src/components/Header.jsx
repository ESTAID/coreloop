import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Mail } from 'lucide-react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 flex items-center justify-between h-16 md:h-20">

        {/* Left: Mobile Menu Toggle + Logo */}
        <div className="flex items-center space-x-4">
          <button className="md:hidden p-2 text-gray-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link to="/" className="flex items-center space-x-2 cursor-pointer">
            <span className="font-medium text-xl tracking-tight text-gray-900 flex items-center">
              <span className="text-blue-600 mr-1.5 font-bold text-2xl">CL</span>
              CoreLoop
            </span>
          </Link>
        </div>

        {/* Center: Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          {[
            { label: '서비스', to: '#' },
            { label: '포트폴리오', to: '#' },
            { label: '블로그', to: '/blog' },
          ].map((item) => (
            <Link key={item.label} to={item.to} className="text-[15px] font-medium text-gray-700 hover:text-blue-600 transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-sm font-medium transition-colors">
            <Mail className="w-4 h-4 mr-2" />
            문의하기
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
