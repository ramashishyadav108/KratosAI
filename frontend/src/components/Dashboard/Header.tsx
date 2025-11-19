import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { authService } from '../../services/auth.service';
import caloriesIcon from '../../assets/calories.png';
import './Header.css';

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
  isEmailVerified: boolean;
}

const Header: React.FC<HeaderProps> = ({}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userData = authService.getUser();
    if (userData) {
      setUser(userData);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  const getInitials = (name: string): string => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getUserDisplayName = (): string => {
    if (user?.email) {
      return user.email;
    }
    if (user?.name) {
      return user.name;
    }
    return 'User';
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      authService.clearAuthData();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear data anyway and redirect
      authService.clearAuthData();
      window.location.href = '/login';
    }
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h1 className="header-title">Lead Pipeline</h1>
      </div>

      <div className="header-center">
        <div className="search-container">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search borrowers, applications, memos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="header-right">
        <button className="header-action-btn ai-assistant">
          <img src={caloriesIcon} alt="AI" className="ai-icon" />
          <span>AI Assistant</span>
        </button>

        <button className="header-icon-btn theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
          {theme === 'light' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </button>

        <button className="header-icon-btn notification-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>

        <div className="user-menu-container" ref={userMenuRef}>
          <div className="user-menu" onClick={() => setShowUserDropdown(!showUserDropdown)}>
            <div className="user-avatar-container">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || 'User'}
                  className="user-avatar-image"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const fallback = parent.querySelector('.user-avatar-fallback') as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div
                className="user-avatar-fallback"
                style={{ display: user?.picture ? 'none' : 'flex' }}
              >
                {getInitials(user?.name || '')}
              </div>
            </div>
            <span className="user-email">{getUserDisplayName()}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          {showUserDropdown && (
            <div className="user-dropdown">
              <button className="user-dropdown-item" onClick={handleLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
