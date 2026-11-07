import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { SendSwapModal } from './components/SendSwapModal';
import { UserProfileModal } from './components/UserProfileModal';
import { TestRunnerModal } from './components/TestRunnerModal';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { BrowseSkillsPage } from './pages/BrowseSkillsPage';
import { SwapRequestsPage } from './pages/SwapRequestsPage';
import { MessagesPage } from './pages/MessagesPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { ProfilePage } from './pages/ProfilePage';
import { ExchangeHistoryPage } from './pages/ExchangeHistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { User } from './types';

function AppContent() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [currentView, setCurrentView] = useState<string>('landing');
  const [browseCategory, setBrowseCategory] = useState<string>('All');

  // Modals state
  const [swapTargetUser, setSwapTargetUser] = useState<User | null>(null);
  const [inspectUser, setInspectUser] = useState<User | null>(null);
  const [showTestRunner, setShowTestRunner] = useState<boolean>(false);

  // Switch to dashboard when user logs in if currently on landing
  React.useEffect(() => {
    if (isAuthenticated && currentView === 'landing') {
      setCurrentView('dashboard');
    }
  }, [isAuthenticated]);

  const handleNavigate = (view: string) => {
    // Guest protection check (Section 15.1 Guest User Security)
    const protectedViews = ['dashboard', 'requests', 'messages', 'ai-assistant', 'profile', 'history', 'settings'];
    if (protectedViews.includes(view) && !isAuthenticated) {
      openAuthModal(`Please log in or register to access ${view.replace('-', ' ')}`, 'login');
      return;
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSwapModal = (targetUser: User) => {
    if (!isAuthenticated) {
      openAuthModal(`Sign in or create an account to propose a skill swap with ${targetUser.name}`, 'login');
      return;
    }
    setSwapTargetUser(targetUser);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Bar Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenTestRunner={() => setShowTestRunner(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onNavigate={handleNavigate}
            onSelectCategory={(cat) => setBrowseCategory(cat)}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardPage
            onNavigate={handleNavigate}
            onOpenSwapModalWithUser={handleOpenSwapModal}
          />
        )}

        {currentView === 'browse' && (
          <BrowseSkillsPage
            initialCategory={browseCategory}
            onOpenSwapModalWithUser={handleOpenSwapModal}
            onViewUserProfile={(u) => setInspectUser(u)}
          />
        )}

        {currentView === 'requests' && (
          <SwapRequestsPage
            onNavigateToMessages={() => setCurrentView('messages')}
            onViewUserProfile={(userId) => {
              // Fetch user & inspect
              fetch(`/api/users/${userId}`)
                .then(r => r.json())
                .then(data => data.user && setInspectUser(data.user))
                .catch(() => {});
            }}
          />
        )}

        {currentView === 'messages' && (
          <MessagesPage />
        )}

        {currentView === 'ai-assistant' && (
          <AIAssistantPage />
        )}

        {currentView === 'profile' && (
          <ProfilePage />
        )}

        {currentView === 'history' && (
          <ExchangeHistoryPage onNavigateToMessages={() => setCurrentView('messages')} />
        )}

        {currentView === 'settings' && (
          <SettingsPage />
        )}
      </main>

      {/* Global Modals */}
      <AuthModal />

      <SendSwapModal
        targetUser={swapTargetUser}
        onClose={() => setSwapTargetUser(null)}
        onSuccess={() => {
          // If on requests page or browse page, state reloads
        }}
      />

      <UserProfileModal
        user={inspectUser}
        onClose={() => setInspectUser(null)}
        onProposeSwap={(u) => {
          setInspectUser(null);
          handleOpenSwapModal(u);
        }}
      />

      {showTestRunner && (
        <TestRunnerModal onClose={() => setShowTestRunner(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
