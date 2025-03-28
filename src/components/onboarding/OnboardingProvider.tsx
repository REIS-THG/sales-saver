
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useTour } from '@/hooks/use-tour';
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

interface OnboardingContextType {
  completedTours: Record<string, boolean>;
  startTour: (tourId: string) => void;
  markTourComplete: (tourId: string) => void;
  resetTours: () => void;
  onboarded: boolean;
  setOnboarded: (value: boolean) => void;
  showOnboardingWelcome: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [completedTours, setCompletedTours] = useState<Record<string, boolean>>({});
  const [onboarded, setOnboarded] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const location = useLocation();
  
  // Initialize completed tours from localStorage
  useEffect(() => {
    const storedTours = localStorage.getItem('completedTours');
    if (storedTours) {
      setCompletedTours(JSON.parse(storedTours));
    }
    
    const hasOnboarded = localStorage.getItem('hasOnboarded') === 'true';
    setOnboarded(hasOnboarded);
    
    // Show welcome message if first time user and not yet onboarded
    if (!hasOnboarded && location.pathname === '/dashboard') {
      const hasSeenWelcome = localStorage.getItem('hasSeenWelcome') === 'true';
      if (!hasSeenWelcome) {
        setShowWelcome(true);
      }
    }
  }, [location.pathname]);
  
  const startTour = (tourId: string) => {
    localStorage.removeItem(`tour-${tourId}-completed`);
    window.location.reload(); // Reload to restart the tour
  };
  
  const markTourComplete = (tourId: string) => {
    const updated = { ...completedTours, [tourId]: true };
    setCompletedTours(updated);
    localStorage.setItem('completedTours', JSON.stringify(updated));
  };
  
  const resetTours = () => {
    // Clear all tour completion statuses
    const tourKeys = Object.keys(localStorage).filter(key => key.startsWith('tour-') && key.endsWith('-completed'));
    tourKeys.forEach(key => localStorage.removeItem(key));
    
    setCompletedTours({});
    localStorage.removeItem('completedTours');
  };
  
  const handleCompleteOnboarding = () => {
    setOnboarded(true);
    localStorage.setItem('hasOnboarded', 'true');
    localStorage.setItem('hasSeenWelcome', 'true');
    setShowWelcome(false);
  };
  
  const showOnboardingWelcome = () => {
    setShowWelcome(true);
  };
  
  return (
    <OnboardingContext.Provider 
      value={{ 
        completedTours, 
        startTour, 
        markTourComplete, 
        resetTours,
        onboarded,
        setOnboarded,
        showOnboardingWelcome
      }}
    >
      {children}
      
      <Drawer open={showWelcome} onOpenChange={setShowWelcome}>
        <DrawerContent>
          <DrawerHeader className="text-center">
            <DrawerTitle className="text-2xl">Welcome to Sales Saver!</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 py-2 text-center">
            <p className="mb-4">
              We'll guide you through the key features of the application to help you get started.
            </p>
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-100 rounded-full p-2">
                  <span className="font-bold text-lg text-indigo-600">1</span>
                </div>
                <p className="text-left">Create and manage your sales deals</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-indigo-100 rounded-full p-2">
                  <span className="font-bold text-lg text-indigo-600">2</span>
                </div>
                <p className="text-left">Get AI-powered insights and analysis</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-indigo-100 rounded-full p-2">
                  <span className="font-bold text-lg text-indigo-600">3</span>
                </div>
                <p className="text-left">Generate reports to track your progress</p>
              </div>
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={handleCompleteOnboarding}>Start Tour</Button>
            <Button variant="outline" onClick={() => {
              localStorage.setItem('hasSeenWelcome', 'true');
              setShowWelcome(false);
            }}>
              Skip Tour
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </OnboardingContext.Provider>
  );
}
