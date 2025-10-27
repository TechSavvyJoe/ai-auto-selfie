/**
 * Tutorial Service
 * Manages onboarding and tutorial system
 */

import { TutorialState, TutorialStep } from '../types';

type TutorialObserver = (state: TutorialState) => void;

const TUTORIAL_STEPS: TutorialStep[] = ['welcome', 'camera', 'editing', 'ai-modes', 'shortcuts', 'presets', 'gallery', 'complete'];

const TUTORIAL_CONTENT: Record<TutorialStep, { title: string; description: string; highlight?: string }> = {
  welcome: {
    title: 'Welcome to AI Auto-Selfie',
    description: 'Transform your photos with AI-powered enhancements. This quick tutorial will show you the key features.',
  },
  camera: {
    title: 'Capture Your Photo',
    description: 'Start by taking a selfie or selecting a photo from your device. Click the camera button to begin.',
    highlight: 'camera',
  },
  editing: {
    title: 'Edit Your Photo',
    description: 'Fine-tune your image with professional adjustment controls. Toggle the adjustments panel for more options.',
    highlight: 'adjustments',
  },
  'ai-modes': {
    title: 'AI Enhancement Modes',
    description: 'Choose from 5 intelligent strategies: Balanced, Vibrant, Professional, Cinematic, and Portrait. Or let AI recommend the best one.',
    highlight: 'auto-enhance',
  },
  shortcuts: {
    title: 'Keyboard Shortcuts',
    description: 'Speed up your workflow with keyboard shortcuts. Press F1 anytime to see all available shortcuts.',
    highlight: 'help',
  },
  presets: {
    title: 'Save Your Style',
    description: 'Create custom presets to quickly apply your favorite settings to future photos.',
    highlight: 'presets',
  },
  gallery: {
    title: 'Your Gallery',
    description: 'Browse, organize, and manage all your enhanced photos. Rate and favorite your best shots.',
    highlight: 'gallery',
  },
  complete: {
    title: 'You\'re All Set!',
    description: 'Start creating amazing photos with AI Auto-Selfie. Have fun!',
  },
};

class TutorialService {
  private state: TutorialState;
  private observers: Set<TutorialObserver> = new Set();
  private readonly STORAGE_KEY = 'ai-selfie-tutorial';

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): TutorialState {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load tutorial state:', error);
    }

    return {
      isActive: true,
      currentStep: 'welcome',
      completedSteps: [],
      shouldShowIntroduction: true,
    };
  }

  private saveState(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
      this.notifyObservers();
    } catch (error) {
      console.error('Failed to save tutorial state:', error);
    }
  }

  private notifyObservers(): void {
    this.observers.forEach(observer => observer({ ...this.state }));
  }

  // Getters
  getState(): TutorialState {
    return { ...this.state };
  }

  getCurrentStep(): TutorialStep {
    return this.state.currentStep;
  }

  getStepContent(step: TutorialStep) {
    return TUTORIAL_CONTENT[step];
  }

  isActive(): boolean {
    return this.state.isActive;
  }

  shouldShowIntroduction(): boolean {
    return this.state.shouldShowIntroduction;
  }

  // Navigation
  nextStep(): void {
    const currentIndex = TUTORIAL_STEPS.indexOf(this.state.currentStep);
    if (currentIndex < TUTORIAL_STEPS.length - 1) {
      const nextStep = TUTORIAL_STEPS[currentIndex + 1];
      this.goToStep(nextStep);
    } else {
      this.complete();
    }
  }

  previousStep(): void {
    const currentIndex = TUTORIAL_STEPS.indexOf(this.state.currentStep);
    if (currentIndex > 0) {
      this.goToStep(TUTORIAL_STEPS[currentIndex - 1]);
    }
  }

  goToStep(step: TutorialStep): void {
    if (!this.state.completedSteps.includes(step)) {
      this.state.completedSteps.push(step);
    }
    this.state.currentStep = step;
    this.state.isActive = true;
    this.saveState();
  }

  skipStep(): void {
    if (!this.state.completedSteps.includes(this.state.currentStep)) {
      this.state.completedSteps.push(this.state.currentStep);
    }
    this.nextStep();
  }

  complete(): void {
    this.state.isActive = false;
    this.state.currentStep = 'complete';
    if (!this.state.completedSteps.includes('complete')) {
      this.state.completedSteps.push('complete');
    }
    this.saveState();
  }

  dismiss(): void {
    this.state.isActive = false;
    this.state.shouldShowIntroduction = false;
    this.saveState();
  }

  reset(): void {
    this.state = {
      isActive: true,
      currentStep: 'welcome',
      completedSteps: [],
      shouldShowIntroduction: true,
    };
    this.saveState();
  }

  // Observer pattern
  subscribe(observer: TutorialObserver): () => void {
    this.observers.add(observer);
    return () => {
      this.observers.delete(observer);
    };
  }
}

let tutorialServiceInstance: TutorialService | null = null;

export function getTutorialService(): TutorialService {
  if (!tutorialServiceInstance) {
    tutorialServiceInstance = new TutorialService();
  }
  return tutorialServiceInstance;
}

export { TUTORIAL_STEPS, TUTORIAL_CONTENT };
