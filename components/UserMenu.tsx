'use client';

import { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';

// Mock user data - centralized for easy replacement later
const MOCK_USER = {
  name: 'John Doe',
  email: 'john.doe@meetingmind.ai',
  initials: 'JD',
};

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Mock handlers - no actual functionality
  const handleProfileClick = () => {
    // Placeholder - no navigation or logic
    console.log('Profile clicked (mock)');
    setIsOpen(false);
  };

  const handleSettingsClick = () => {
    // Placeholder - no navigation or logic
    console.log('Settings clicked (mock)');
    setIsOpen(false);
  };

  const handleLogoutClick = () => {
    // Placeholder - no actual logout logic
    console.log('Logout clicked (mock)');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={toggleDropdown}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleDropdown();
          }
        }}
        className="flex items-center gap-2 focus:outline-none"
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar Circle */}
        <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#25C9D0] to-[#14B8A6] flex items-center justify-center text-white font-semibold text-sm">
          {MOCK_USER.initials}
        </div>
        {/* Chevron Icon - hidden on mobile */}
        <ChevronDown 
          className={`h-4 w-4 text-slate-600 transition-transform duration-200 hidden sm:block ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-[12px] border-2 border-slate-200 shadow-xl z-50 overflow-hidden fade-in-up sm:right-0">
          {/* User Info Section */}
          <div className="px-4 py-4 border-b-2 border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#25C9D0] to-[#14B8A6] flex items-center justify-center text-white font-semibold">
                {MOCK_USER.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-600 truncate">
                  {MOCK_USER.name}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {MOCK_USER.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={handleProfileClick}
              className="w-full px-4 py-3 text-left hover:bg-[#25C9D0]/5 transition-colors flex items-center gap-3 text-sm font-medium text-slate-700 cursor-pointer focus:outline-none focus:bg-[#25C9D0]/5"
              tabIndex={0}
            >
              <User className="h-4 w-4 text-[#25C9D0]" />
              <span>Profile</span>
            </button>

            <button
              onClick={handleSettingsClick}
              className="w-full px-4 py-3 text-left hover:bg-[#25C9D0]/5 transition-colors flex items-center gap-3 text-sm font-medium text-slate-700 cursor-pointer focus:outline-none focus:bg-[#25C9D0]/5"
              tabIndex={0}
            >
              <Settings className="h-4 w-4 text-[#25C9D0]" />
              <span>Settings</span>
            </button>

            {/* Divider */}
            <div className="my-2 border-t-2 border-slate-100"></div>

            <button
              onClick={handleLogoutClick}
              className="w-full px-4 py-3 text-left hover:bg-red-50 transition-colors flex items-center gap-3 text-sm font-medium text-red-600 cursor-pointer focus:outline-none focus:bg-red-50"
              tabIndex={0}
            >
              <LogOut className="h-4 w-4 text-red-600" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

