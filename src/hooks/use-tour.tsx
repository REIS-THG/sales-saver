
import { useState, useEffect } from 'react';
import { ReactNode } from 'react';

// Mock version until we properly implement with react-joyride
const STATUS = {
  FINISHED: 'FINISHED',
  SKIPPED: 'SKIPPED'
};

// Tour step definitions for each tour
const tourSteps = {
  dashboard: [
    {
      target: '.dashboard-header',
      content: 'This is your deal dashboard where you can manage all your sales opportunities',
      disableBeacon: true
    },
    {
      target: '.create-deal-button',
      content: 'Click here to create a new deal'
    },
    {
      target: '.dashboard-content',
      content: 'Here you can see all your deals, sort, filter, and take actions on them'
    }
  ],
  'ai-analysis': [
    {
      target: '.analysis-header',
      content: 'The AI Analysis tool helps you get insights and recommendations for your deals',
      disableBeacon: true
    },
    {
      target: '.analysis-tabs',
      content: 'Switch between different analysis views using these tabs'
    },
    {
      target: '.analysis-settings',
      content: 'Configure your analysis settings here, including PII filtering and retention options'
    }
  ],
  reports: [
    {
      target: '.reports-header',
      content: 'Generate custom reports to visualize your sales performance',
      disableBeacon: true
    },
    {
      target: '.report-list',
      content: 'View your saved reports here'
    },
    {
      target: '.create-report-button',
      content: 'Click here to create a new custom report'
    }
  ],
  subscription: [
    {
      target: '.subscription-header',
      content: 'Manage your subscription plan and billing details here',
      disableBeacon: true
    },
    {
      target: '.subscription-plans',
      content: 'View and compare available plans'
    },
    {
      target: '.subscription-usage',
      content: 'Monitor your usage against plan limits'
    }
  ]
};

export function useTour(tourId: string) {
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<any[]>([]);
  const [tourKey, setTourKey] = useState(0);

  // Load saved tour state on mount
  useEffect(() => {
    const hasTourCompleted = localStorage.getItem(`tour-${tourId}-completed`);
    if (!hasTourCompleted) {
      setRun(true);
    }
    setSteps(tourSteps[tourId as keyof typeof tourSteps] || []);
  }, [tourId]);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
      localStorage.setItem(`tour-${tourId}-completed`, 'true');
    }
  };

  const resetTour = () => {
    localStorage.removeItem(`tour-${tourId}-completed`);
    setTourKey((prev) => prev + 1);
    setRun(true);
  };

  // Tour component that can be used in the page (temporary mock implementation)
  const TourComponent = () => {
    return null; // Placeholder until we properly implement with react-joyride
  };

  return {
    TourComponent,
    resetTour
  };
}
