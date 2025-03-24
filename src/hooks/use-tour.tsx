
import { useState, useEffect } from 'react';
import Joyride, { CallBackProps, Step, STATUS } from 'react-joyride';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

type TourId = 'dashboard' | 'dealCreation' | 'reports' | 'aiAnalysis';

// Tour steps by page
const tourSteps: Record<TourId, Step[]> = {
  dashboard: [
    {
      target: '.dashboard-header',
      content: 'Welcome to your Sales Dashboard! This is where you can manage all your deals.',
      disableBeacon: true,
      placement: 'bottom',
    },
    {
      target: '.create-deal-button',
      content: 'Click here to create a new deal and start tracking it.',
      placement: 'bottom-end',
    },
    {
      target: '.deals-table',
      content: 'Here you can see all your deals. Click on any deal to view details or add notes.',
      placement: 'top',
    },
    {
      target: '.dashboard-content',
      content: 'You can filter, sort and search your deals to find exactly what you need.',
      placement: 'top',
    },
  ],
  dealCreation: [
    {
      target: '.deal-form',
      content: 'Fill out the details of your new deal here.',
      disableBeacon: true,
    },
    {
      target: '.custom-fields-section',
      content: 'Add any custom fields you need to better organize your deals.',
      placement: 'top',
    },
  ],
  reports: [
    {
      target: '.reports-header',
      content: 'Generate powerful reports to analyze your sales performance.',
      disableBeacon: true,
    },
    {
      target: '.report-templates',
      content: 'Choose from these templates or create your own custom report.',
      placement: 'bottom',
    },
  ],
  aiAnalysis: [
    {
      target: '.analysis-header',
      content: 'Our AI can analyze your deals and provide insights to help you close more deals.',
      disableBeacon: true,
    },
    {
      target: '.analysis-form',
      content: 'Select a deal and upload any supporting documents for analysis.',
      placement: 'bottom',
    },
  ],
};

// Check if this is the user's first visit to a page
const isFirstVisit = (pageId: string): boolean => {
  const visited = localStorage.getItem(`tour-${pageId}-completed`);
  return !visited;
};

// Mark a tour as completed
const markTourCompleted = (pageId: string): void => {
  localStorage.setItem(`tour-${pageId}-completed`, 'true');
};

export function useTour(tourId: TourId) {
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Set steps based on tourId
    setSteps(tourSteps[tourId] || []);

    // Check if this is the first visit and user hasn't seen this tour
    const shouldStartTour = isFirstVisit(tourId);
    
    // Small delay to ensure DOM elements are loaded
    const timer = setTimeout(() => {
      setRun(shouldStartTour);
    }, 1000);

    return () => clearTimeout(timer);
  }, [tourId, location.pathname]);

  // Reset the tour (for manual triggering)
  const resetTour = () => {
    setRun(true);
  };

  // Skip all tours for this user
  const skipAllTours = () => {
    Object.keys(tourSteps).forEach(id => {
      markTourCompleted(id);
    });
    setRun(false);
    toast({
      title: "Tours disabled",
      description: "You can restart tours from the help menu anytime.",
    });
  };

  // Handle tour callbacks
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setRun(false);
      markTourCompleted(tourId);

      if (status === STATUS.FINISHED) {
        toast({
          title: "Tour Completed!",
          description: "You can restart the tour from the help menu anytime.",
          duration: 5000,
        });
      }
    }
  };

  // Tour component that can be used in any page
  const TourComponent = () => (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      showProgress
      styles={{
        options: {
          primaryColor: '#8B5CF6', // Indigo color
          zIndex: 10000,
        },
        buttonNext: {
          backgroundColor: '#8B5CF6',
        },
        buttonBack: {
          color: '#8B5CF6',
        },
      }}
      callback={handleJoyrideCallback}
      locale={{
        last: 'Finish',
        skip: 'Skip tour',
      }}
    />
  );

  return {
    TourComponent,
    resetTour,
    skipAllTours,
    isRunning: run,
  };
}
