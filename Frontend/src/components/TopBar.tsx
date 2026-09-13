import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Sparkles, ArrowUpRight, CheckCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

interface TopBarProps {
  onSearch?: (query: string) => void;
  searchValue?: string;
}

export function TopBar({ onSearch, searchValue = '' }: TopBarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, isConnected, markAsRead, markAllAsRead } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'just now';
    try {
      const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
      if (diffSec < 60) return 'just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return `${Math.floor(diffSec / 86400)}d ago`;
    } catch {
      return 'recently';
    }
  };

  return (
    <header className="relative z-40 h-12 px-3 sm:px-4 border border-outline-variant/30 bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl shadow-xs flex items-center justify-between gap-3">
      {/* Global Search Bar - Compact & Sleek */}
      <div className="flex-1 max-w-md relative">
        <Search className="w-3.5 h-3.5 text-on-surface-variant/70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearch?.(e.target.value)}
          placeholder="Search employee, role, department, or risk..."
          className="w-full pl-8.5 pr-3 py-1 text-xs bg-surface-container-low/50 hover:bg-surface-container-low focus:bg-surface-container-lowest text-on-surface rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-on-surface-variant/60 shadow-2xs h-8"
        />
      </div>

      {/* Right Action Icons & Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Quick Copilot button */}
        <button
          onClick={() => navigate('/copilot')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary-fixed text-primary hover:bg-primary hover:text-on-primary transition-all text-xs font-semibold shadow-2xs h-8"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask Copilot</span>
        </button>

        {/* Active Workspace View Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-low rounded-xl border border-outline-variant/20 text-xs font-semibold text-on-surface shadow-2xs h-8">
          <span className={`w-1.5 h-1.5 rounded-full ${user.role === 'HR Admin' ? 'bg-primary' : 'bg-emerald-500'}`} />
          <span className="text-[11px]">{user.role === 'HR Admin' ? 'HR Executive View' : 'Manager Squad View'}</span>
        </div>

        {/* Notification Bell (Clean icon without square boundary) */}
        <div className="relative z-50" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 text-on-surface-variant hover:text-on-surface transition-colors relative flex items-center justify-center rounded-lg hover:bg-surface-container-low"
            title="Workforce Real-Time Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 ? (
              <span className="min-w-[15px] h-[15px] px-0.5 rounded-full bg-error text-white font-bold text-[9px] flex items-center justify-center absolute -top-0.5 -right-0.5 shadow-xs ring-2 ring-surface-container-lowest animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : isConnected ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-0.5 right-0.5 ring-2 ring-surface-container-lowest" title="Live stream active" />
            ) : null}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-96 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-2xl p-3.5 z-50 flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Real-time Alerts
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="text-[11px] text-on-surface-variant hover:text-primary flex items-center gap-1 transition-colors"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Notification Items List */}
              <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="text-center py-5 text-on-surface-variant text-xs flex flex-col items-center gap-1.5">
                    <Bell className="w-5 h-5 text-outline-variant" />
                    <span>No notifications right now.</span>
                    <span className="text-[10px] text-on-surface-variant/70">Workforce telemetry is nominal.</span>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const isCritical = notif.severity === 'critical';
                    const isWarning = notif.severity === 'warning';
                    const cardBg = isCritical
                      ? notif.read
                        ? 'bg-surface-container-low/50 hover:bg-surface-container-low'
                        : 'bg-error-container/20 hover:bg-error-container/30 border border-error/30'
                      : isWarning
                      ? notif.read
                        ? 'bg-surface-container-low/50 hover:bg-surface-container-low'
                        : 'bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30'
                      : 'bg-surface-container-low/50 hover:bg-surface-container-low';

                    const titleColor = isCritical
                      ? 'text-error'
                      : isWarning
                      ? 'text-amber-700'
                      : 'text-primary';

                    return (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markAsRead(notif.id);
                          if (notif.link) {
                            navigate(notif.link);
                          } else if (notif.employeeId) {
                            navigate(`/employees/${notif.employeeId}`);
                          }
                          setShowNotifications(false);
                        }}
                        className={`p-2.5 rounded-xl cursor-pointer transition-all flex flex-col gap-1 relative ${cardBg}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${titleColor} flex items-center gap-1.5`}>
                            {!notif.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-error" />
                            )}
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-on-surface-variant/70">
                            {formatTimeAgo(notif.createdAt)}
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Footer */}
              <button
                onClick={() => {
                  setShowNotifications(false);
                  navigate('/dashboard');
                }}
                className="text-xs text-primary font-semibold text-center hover:underline pt-1.5 border-t border-outline-variant/20 flex items-center justify-center gap-1"
              >
                <span>View Full Watchlist</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
