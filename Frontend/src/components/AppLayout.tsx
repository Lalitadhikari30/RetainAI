import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppLayout() {
  const { isAuthenticated } = useAuth();
  const [globalSearch, setGlobalSearch] = useState('');
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Remove navbar completely from Copilot and Data Ingestion pages
  const isCopilot = location.pathname.startsWith('/copilot');
  const isUpload = location.pathname.startsWith('/upload');
  const hideTopBar = isCopilot || isUpload;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface font-sans text-on-surface">
      {/* Sidebar with standalone logo & rounded squircle card */}
      <Sidebar />

      {/* Main Area: TopBar card + Scrollable Content */}
      <div className="flex-1 h-screen overflow-hidden flex flex-col min-w-0 bg-surface">
        {!hideTopBar && (
          <div className="relative z-40 pt-3 pr-3 pl-1.5 shrink-0">
            <TopBar searchValue={globalSearch} onSearch={setGlobalSearch} />
          </div>
        )}

        <main
          className={`relative z-10 flex-1 min-h-0 overflow-y-auto w-full ${
            isCopilot
              ? 'p-3 pl-1.5 h-screen flex flex-col overflow-hidden'
              : isUpload
              ? 'p-4 md:p-6 pl-1.5 pr-3'
              : 'p-4 md:p-6 pl-1.5 pr-3'
          }`}
        >
          <div
            className={`w-full mx-auto ${
              isCopilot
                ? 'h-full flex flex-col min-h-0'
                : isUpload
                ? 'max-w-7xl'
                : 'max-w-[1440px]'
            }`}
          >
            <Outlet context={{ globalSearch, setGlobalSearch }} />
          </div>
        </main>
      </div>
    </div>
  );
}
