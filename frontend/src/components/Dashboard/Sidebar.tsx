import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  children?: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
      path: '/dashboard',
    },
    {
      id: 'deal-sourcing',
      label: 'Deal sourcing & Tracking',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      path: '/deal-sourcing',
      children: [
        {
          id: 'create-leads',
          label: 'Create All Leads in the System',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          ),
          path: '/deal-sourcing/create-leads',
        },
        {
          id: 'leads-detail',
          label: 'Leads Detail Screen',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          ),
          path: '/deal-sourcing/leads-detail',
        },
      ],
    },
    {
      id: 'application-management',
      label: 'Application Management',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
      path: '/application-management',
    },
  ];

  const bottomMenuItems: MenuItem[] = [
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
      path: '/settings',
    },
    {
      id: 'help',
      label: 'Help',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
      path: '/help',
    },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isParentActive = (item: MenuItem) => {
    if (isActive(item.path)) return true;
    if (item.children) {
      return item.children.some(child => isActive(child.path));
    }
    return false;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <span>LS</span>
          </div>
          {!collapsed && (
            <div className="logo-text">
              <span className="logo-title">LendStream_AI</span>
              <span className="logo-subtitle">Lender Portal</span>
            </div>
          )}
        </div>
        <button className="sidebar-toggle" onClick={onToggle}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            {collapsed ? (
              <>
                <polyline points="6 18 12 12 6 6" />
                <polyline points="12 18 18 12 12 6" />
              </>
            ) : (
              <>
                <polyline points="18 18 12 12 18 6" />
                <polyline points="12 18 6 12 12 6" />
              </>
            )}
          </svg>
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.id} className="sidebar-menu-item">
              <button
                className={`sidebar-menu-button ${isParentActive(item) ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
              >
                <span className="menu-icon">{item.icon}</span>
                {!collapsed && <span className="menu-label">{item.label}</span>}
              </button>
              {!collapsed && item.children && (
                <ul className="sidebar-submenu">
                  {item.children.map((child) => (
                    <li key={child.id} className="sidebar-submenu-item">
                      <button
                        className={`sidebar-submenu-button ${isActive(child.path) ? 'active' : ''}`}
                        onClick={() => handleNavigation(child.path)}
                      >
                        <span className="submenu-icon">{child.icon}</span>
                        <span className="submenu-label">{child.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <ul className="sidebar-menu">
          {bottomMenuItems.map((item) => (
            <li key={item.id} className="sidebar-menu-item">
              <button
                className={`sidebar-menu-button ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
              >
                <span className="menu-icon">{item.icon}</span>
                {!collapsed && <span className="menu-label">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
