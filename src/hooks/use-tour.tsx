
import { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

// Define valid tour IDs
export type TourId = 'dashboard' | 'ai-analysis' | 'reports' | 'subscription';

// Tour step definitions for each tour
const tourSteps: Record<TourId, Step[]> = {
  dashboard: [
    {
      target: '.dashboard-header',
      content: 'This is your deal dashboard where you can manage all your sales opportunities',
      disableBeacon: true,
    },
    {
      target: '.create-deal-button',
      content: 'Click here to create a new deal',
    },
    {
      target: '.dashboard-content',
      content: 'Here you can see all your deals, sort, filter, and take actions on them',
    },
  ],
  'ai-analysis': [
    {
      target: '.analysis-header',
      content: 'The AI Analysis tool helps you get insights and recommendations for your deals',
      disableBeacon: true,
    },
    {
      target: '.analysis-tabs',
      content: 'Switch between different analysis views using these tabs',
    },
    {
      target: '.analysis-settings',
      content: 'Configure your analysis settings here, including PII filtering and retention options',
    },
  ],
  reports: [
    {
      target: '.reports-header',
      content: 'Generate custom reports to visualize your sales performance',
      disableBeacon: true,
    },
    {
      target: '.report-list',
      content: 'View your saved reports here',
    },
    {
      target: '.create-report-button',
      content: 'Click here to create a new custom report',
    },
  ],
  subscription: [
    {
      target: '.subscription-header',
      content: 'Manage your subscription plan and billing details here',
      disableBeacon: true,
    },
    {
      target: '.subscription-plans',
      content: 'View and compare available plans',
    },
    {
      target: '.subscription-usage',
      content: 'Monitor your usage against plan limits',
    },
  ],
};

export function useTour(tourId: TourId) {
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [tourKey, setTourKey] = useState(0);

  // Load saved tour state on mount
  useEffect(() => {
    const hasTourCompleted = localStorage.getItem(`tour-${tourId}-completed`);
    if (!hasTourCompleted) {
      setRun(true);
    }
    setSteps(tourSteps[tourId] || []);
  }, [tourId]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
      localStorage.setItem(`tour-${tourId}-completed`, 'true');
    }
  };

  const resetTour = () => {
    localStorage.removeItem(`tour-${tourId}-completed`);
    setTourKey(prev => prev + 1);
    setRun(true);
  };

  // Tour component that can be used in the page
  const TourComponent = () => (
    <Joyride
      key={tourKey}
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          zIndex: 10000,
        },
      }}
    />
  );

  return { TourComponent, resetTour };
}
