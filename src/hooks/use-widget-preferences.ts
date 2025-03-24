
import { useState, useEffect } from 'react';

export interface WidgetPreference {
  id: string;
  visible: boolean;
  order: number;
}

export function useWidgetPreferences(defaultWidgets: string[]) {
  const [preferences, setPreferences] = useState<WidgetPreference[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved preferences from localStorage on mount
  useEffect(() => {
    const savedPrefs = localStorage.getItem('dashboardWidgetPreferences');
    
    if (savedPrefs) {
      try {
        const parsedPrefs = JSON.parse(savedPrefs);
        setPreferences(parsedPrefs);
      } catch (e) {
        console.error('Failed to parse saved widget preferences', e);
        initializeDefaultPreferences();
      }
    } else {
      initializeDefaultPreferences();
    }
    
    setIsLoaded(true);
  }, []);

  // Initialize default preferences if none exist
  const initializeDefaultPreferences = () => {
    const initialPrefs: WidgetPreference[] = defaultWidgets.map((id, index) => ({
      id,
      visible: true,
      order: index
    }));
    
    setPreferences(initialPrefs);
    savePreferences(initialPrefs);
  };

  // Save preferences to localStorage
  const savePreferences = (prefs: WidgetPreference[]) => {
    localStorage.setItem('dashboardWidgetPreferences', JSON.stringify(prefs));
  };

  // Update visibility of a widget
  const toggleWidgetVisibility = (widgetId: string) => {
    const updatedPrefs = preferences.map(pref => 
      pref.id === widgetId 
        ? { ...pref, visible: !pref.visible } 
        : pref
    );
    
    setPreferences(updatedPrefs);
    savePreferences(updatedPrefs);
  };

  // Reorder widgets
  const reorderWidgets = (orderedIds: string[]) => {
    const updatedPrefs = [...preferences];
    
    orderedIds.forEach((id, index) => {
      const widgetIndex = updatedPrefs.findIndex(pref => pref.id === id);
      if (widgetIndex !== -1) {
        updatedPrefs[widgetIndex].order = index;
      }
    });
    
    setPreferences(updatedPrefs);
    savePreferences(updatedPrefs);
  };

  // Get sorted and filtered widgets based on preferences
  const getVisibleWidgets = () => {
    return [...preferences]
      .filter(pref => pref.visible)
      .sort((a, b) => a.order - b.order)
      .map(pref => pref.id);
  };

  return {
    preferences,
    isLoaded,
    toggleWidgetVisibility,
    reorderWidgets,
    getVisibleWidgets
  };
}
