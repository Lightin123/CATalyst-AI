import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Brain,
  Zap,
  LineChart,
  LogOut,
  Sparkles,
  PanelLeftClose,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  path: string;
  intent?: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'cat_prep', label: 'CAT Prep', icon: BookOpen, path: '/workspace', intent: 'cat_prep' },
  { id: 'fat_prep', label: 'FAT Prep', icon: GraduationCap, path: '/workspace', intent: 'fat_prep' },
  { id: 'concept_builder', label: 'Concept Builder', icon: Brain, path: '/workspace', intent: 'concept_builder' },
  { id: 'rapid_fire', label: 'Rapid Fire', icon: Zap, path: '/workspace', intent: 'rapid_fire' },
  { id: 'predict_exam', label: 'Predict Exam', icon: LineChart, path: '/workspace', intent: 'predict_exam' },
];

export default function NavSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const currentIntent = sessionStorage.getItem('current_intent') || '';

  const handleNav = (path: string, intent?: string) => {
    if (intent) {
      sessionStorage.setItem('current_intent', intent);
      // Dispatch custom event so Workspace detects the intent change
      window.dispatchEvent(new CustomEvent('intentChanged', { detail: intent }));
    }
    navigate(path);
  };

  const handleSignOut = () => {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('current_intent');
    navigate('/');
  };

  const isActive = (item: NavItem) => {
    if (item.intent) {
      return location.pathname === item.path && currentIntent === item.intent;
    }
    return location.pathname === item.path && !item.intent;
  };

  return (
    <aside
      className={`nav-sidebar ${collapsed ? 'nav-sidebar--collapsed' : ''}`}
    >
      {/* Top Bar */}
      <div className="nav-sidebar__topbar">
        <button
          className="nav-sidebar__topbar-btn"
          onClick={() => collapsed ? setCollapsed(false) : navigate('/dashboard')}
          title={collapsed ? 'Expand sidebar' : 'CATalyst AI'}
        >
          <Sparkles size={20} />
        </button>
        {!collapsed && (
          <button
            className="nav-sidebar__topbar-btn"
            onClick={() => setCollapsed(true)}
            title="Collapse sidebar"
          >
            <PanelLeftClose size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="nav-sidebar__nav">
        <ul className="nav-sidebar__list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNav(item.path, item.intent)}
                  className={`nav-sidebar__item ${active ? 'nav-sidebar__item--active' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={20} className="nav-sidebar__item-icon" />
                  {!collapsed && (
                    <span className="nav-sidebar__item-label">{item.label}</span>
                  )}
                  {active && !collapsed && (
                    <span className="nav-sidebar__item-badge" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sign Out */}
      <div className="nav-sidebar__footer">
        <button
          onClick={handleSignOut}
          className="nav-sidebar__signout"
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
