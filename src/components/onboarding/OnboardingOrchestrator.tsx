import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Onboarding } from '@/components/Onboarding';
import { ProductTour } from './ProductTour';
import { GoalWizard } from './GoalWizard';

// ============================================
// UNIFIED ONBOARDING STATE
// Single source of truth for all onboarding
// ============================================

export interface OnboardingState {
  welcomeCompleted: boolean;
  goalWizardCompleted: boolean;
  productTourCompleted: boolean;
  checklistCompleted: boolean;
}

interface OnboardingContextType {
  state: OnboardingState;
  completeStep: (step: keyof OnboardingState) => void;
  resetOnboarding: () => void;
  getCurrentPhase: () => 'welcome' | 'goal-wizard' | 'product-tour' | 'complete';
}

const ONBOARDING_STATE_KEY = 'oneiros_onboarding_state';

const defaultState: OnboardingState = {
  welcomeCompleted: false,
  goalWizardCompleted: false,
  productTourCompleted: false,
  checklistCompleted: false,
};

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingOrchestrator');
  }
  return context;
}

/**
 * Unified Onboarding Orchestrator
 * Controls the flow: Welcome → GoalWizard → ProductTour → Complete
 */
export function OnboardingOrchestrator({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OnboardingState>(() => {
    // Load from localStorage on init
    if (typeof window === 'undefined') return defaultState;
    
    const saved = localStorage.getItem(ONBOARDING_STATE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultState;
      }
    }
    
    // Migrate from old localStorage keys
    const legacyWelcome = localStorage.getItem('hasCompletedOnboarding');
    const legacyTour = localStorage.getItem('hasCompletedProductTour');
    const legacyGoal = localStorage.getItem('hasCompletedGoalWizard');
    
    return {
      welcomeCompleted: legacyWelcome === 'true',
      goalWizardCompleted: legacyGoal === 'true',
      productTourCompleted: legacyTour === 'true',
      checklistCompleted: false,
    };
  });

  // Persist state changes
  useEffect(() => {
    localStorage.setItem(ONBOARDING_STATE_KEY, JSON.stringify(state));
    
    // Also maintain legacy keys for backward compatibility
    localStorage.setItem('hasCompletedOnboarding', String(state.welcomeCompleted));
    localStorage.setItem('hasCompletedProductTour', String(state.productTourCompleted));
    localStorage.setItem('hasCompletedGoalWizard', String(state.goalWizardCompleted));
  }, [state]);

  const completeStep = useCallback((step: keyof OnboardingState) => {
    setState(prev => ({ ...prev, [step]: true }));
  }, []);

  const resetOnboarding = useCallback(() => {
    setState(defaultState);
    localStorage.removeItem(ONBOARDING_STATE_KEY);
    localStorage.removeItem('hasCompletedOnboarding');
    localStorage.removeItem('hasCompletedProductTour');
    localStorage.removeItem('hasCompletedGoalWizard');
    window.location.reload();
  }, []);

  const getCurrentPhase = useCallback(() => {
    if (!state.welcomeCompleted) return 'welcome';
    if (!state.goalWizardCompleted) return 'goal-wizard';
    if (!state.productTourCompleted) return 'product-tour';
    return 'complete';
  }, [state]);

  return (
    <OnboardingContext.Provider value={{ state, completeStep, resetOnboarding, getCurrentPhase }}>
      {children}
      {/* Welcome Dialog - first thing new users see */}
      <Onboarding />
      {/* Goal Wizard - shown after welcome */}
      <GoalWizard />
      {/* Product Tour - shown after goal wizard */}
      <ProductTour />
    </OnboardingContext.Provider>
  );
}

/**
 * Helper to reset all onboarding (for help menu)
 */
export function resetAllOnboarding() {
  localStorage.removeItem(ONBOARDING_STATE_KEY);
  localStorage.removeItem('hasCompletedOnboarding');
  localStorage.removeItem('hasCompletedProductTour');
  localStorage.removeItem('hasCompletedGoalWizard');
  localStorage.removeItem('oneiros_onboarding_checklist');
  window.location.reload();
}

/**
 * Helper to show specific onboarding component
 */
export function showOnboardingStep(step: 'welcome' | 'goal-wizard' | 'product-tour') {
  const events = {
    'welcome': 'show-welcome-onboarding',
    'goal-wizard': 'show-goal-wizard',
    'product-tour': 'show-product-tour',
  };
  window.dispatchEvent(new CustomEvent(events[step]));
}
