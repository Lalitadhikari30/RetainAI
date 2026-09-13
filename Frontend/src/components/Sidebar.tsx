import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  UploadCloud,
  Layers,
  ShieldCheck,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('retainai_sidebar_collapsed') === 'true';
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('retainai_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    showToast('Signed out of RetainAI', 'info');
    navigate('/login');
  };

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: 'Manager Copilot',
      path: '/copilot',
      icon: Bot,
      badge: 'AI',
    },
    ...(user?.role === 'HR Admin'
      ? [
          {
            label: 'Data Ingestion',
            path: '/upload',
            icon: UploadCloud,
            badge: null,
          },
        ]
      : []),
  ];

  return (
    <div
      className={`h-screen flex flex-col p-3 pr-1.5 transition-all duration-300 ease-in-out select-none shrink-0 z-30 ${
        isCollapsed ? 'w-[76px]' : 'w-[250px]'
      }`}
    >
      {/* Standalone Logo Header - Completely outside any navbar / card container */}
      <div
        className={`flex items-center pb-2.5 pt-0.5 transition-all ${
          isCollapsed ? 'justify-center px-0' : 'justify-start px-1'
        }`}
      >
        <div
          onClick={() => navigate('/dashboard')}
          className="cursor-pointer group flex items-center gap-2.5 px-1 min-w-0"
          title="RetainAI - Predict • Prevent • Retain"
        >
          {isCollapsed ? (
            <img
              src="/retainai-icon.png"
              alt="RetainAI"
              className="w-10 h-10 object-contain rounded-xl shadow-xs group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src="/retainai-icon.png"
                alt="RetainAI"
                className="w-10 h-10 object-contain rounded-xl shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col min-w-0 justify-center">
                <img
                  src="/retainai-wordmark.png"
                  alt="RetainAI"
                  className="h-6 w-auto object-contain object-left shrink-0"
                />
                <span className="text-[9px] font-bold tracking-wider text-primary uppercase whitespace-nowrap leading-none mt-1">
                  Predict • Prevent • Retain
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Card - Rounded Square / Squircle Shape */}
      <aside className="flex-1 flex flex-col justify-between bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-xs overflow-hidden">
        {/* Top Navigation Section */}
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Card Header with Expand/Contract toggle button added inside sidebar */}
          {isCollapsed ? (
            <div className="flex items-center justify-center p-2 border-b border-outline-variant/15">
              <button
                onClick={toggleCollapse}
                title="Expand Sidebar"
                aria-label="Expand Sidebar"
                className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60 rounded-xl transition-colors"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between px-3 py-2 border-b border-outline-variant/15">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/80">
                Workforce Intelligence
              </span>
              <button
                onClick={toggleCollapse}
                title="Collapse Sidebar"
                aria-label="Collapse Sidebar"
                className="p-1 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60 rounded-lg transition-colors"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
          )}

          <nav className="p-2 flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={isCollapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center rounded-xl font-semibold transition-all duration-150 ${
                      isCollapsed
                        ? `w-10 h-10 mx-auto justify-center ${
                            isActive
                              ? 'bg-primary text-on-primary shadow-xs'
                              : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                          }`
                        : `justify-between px-3 py-2 text-xs ${
                            isActive
                              ? 'bg-primary text-on-primary shadow-xs'
                              : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                          }`
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-on-primary' : 'text-secondary'}`} />
                        {!isCollapsed && <span>{item.label}</span>}
                      </div>
                      {!isCollapsed && item.badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                            isActive
                              ? 'bg-on-primary text-primary'
                              : 'bg-primary-fixed text-primary'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Integrations & Models Section */}
          <div className="mt-2 pt-2 px-2 border-t border-outline-variant/15">
            {!isCollapsed && (
              <div className="px-1.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/80">
                Integrations & Models
              </div>
            )}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => showToast('Predictive model v2.4 running with 94.8% precision', 'info')}
                title={isCollapsed ? 'Model Engine (v2.4)' : undefined}
                className={`flex items-center rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all ${
                  isCollapsed
                    ? 'w-10 h-10 mx-auto justify-center'
                    : 'w-full justify-between px-3 py-1.5 text-xs text-left'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-secondary shrink-0" />
                  {!isCollapsed && <span>Model Engine</span>}
                </div>
                {!isCollapsed && <span className="text-[10px] font-mono text-secondary">v2.4</span>}
              </button>

              <button
                onClick={() => showToast('HRIS Workday connector live and synchronized', 'info')}
                title={isCollapsed ? 'Workday HRIS (Live)' : undefined}
                className={`flex items-center rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all ${
                  isCollapsed
                    ? 'w-10 h-10 mx-auto justify-center'
                    : 'w-full justify-between px-3 py-1.5 text-xs text-left'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-secondary shrink-0" />
                  {!isCollapsed && <span>Workday HRIS</span>}
                </div>
                {!isCollapsed && (
                  <span className="text-[10px] font-medium text-emerald-600 font-mono">Live</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Model Telemetry & User Card */}
        <div className="p-2 border-t border-outline-variant/20 flex flex-col gap-2">
          {/* Model Telemetry Box */}
          {!isCollapsed ? (
            <div className="p-2 rounded-xl bg-surface-container-low/70 border border-outline-variant/20 flex flex-col gap-0.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-on-surface">
                <span>Model Telemetry</span>
                <span className="text-emerald-600 font-mono">94.8% Acc</span>
              </div>
              <p className="text-[9px] text-on-surface-variant leading-tight">
                Trained on 14,000+ tech attrition trajectories.
              </p>
            </div>
          ) : (
            <div
              className="w-10 h-10 mx-auto rounded-xl bg-surface-container-low/70 border border-outline-variant/20 flex items-center justify-center text-emerald-600 cursor-pointer"
              title="Telemetry: 94.8% Accuracy"
              onClick={() => showToast('Telemetry: 94.8% Accuracy trained on 14,000+ trajectories', 'info')}
            >
              <Activity className="w-4 h-4" />
            </div>
          )}

          {/* User Profile Card */}
          {!isCollapsed ? (
            <div className="flex items-center justify-between p-1.5 rounded-xl bg-surface-container-low/50">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-outline-variant/40 shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-on-surface truncate">{user.name}</span>
                  <span className="text-[10px] font-semibold text-primary truncate">{user.role}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-1 text-on-surface-variant hover:text-error hover:bg-error-container/40 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <img
                src={user.avatar}
                alt={user.name}
                title={`${user.name} (${user.role})`}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-outline-variant/40 cursor-pointer"
              />
              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/40 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
