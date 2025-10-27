/**
 * Onboarding Flow Component
 * Interactive tutorial system guiding new users through app features
 * Shows tips, highlights, and walkthroughs
 */

import React, { useState, useCallback } from 'react';
import Modal from './common/Modal';
import Button from './common/Button';
import Icon from './common/Icon';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for element highlighting
  position?: 'top' | 'bottom' | 'left' | 'right';
  image?: string; // Optional screenshot/illustration
  action?: string; // CTA text
  skipAllowed?: boolean;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Dealership Social Studio',
    description:
      'Create stunning, AI-enhanced social media posts for vehicle deliveries in seconds.',
    image: '🎬',
    skipAllowed: true,
  },
  {
    id: 'camera',
    title: 'Capture Your Moment',
    description:
      'Take a selfie with your customer and their new vehicle. Support for front and rear cameras.',
    target: '[data-tutorial="camera-button"]',
    position: 'top',
    skipAllowed: true,
  },
  {
    id: 'editing',
    title: 'Customize & Enhance',
    description:
      'Choose from professional themes, add custom text, upload your logo, and adjust the image with advanced filters.',
    target: '[data-tutorial="theme-selector"]',
    position: 'left',
    skipAllowed: true,
  },
  {
    id: 'ai-magic',
    title: 'AI Enhancement Magic',
    description:
      "Let our AI transform your photo with cinematic lighting, colors, and professional styling while keeping your subjects unchanged.",
    image: '✨',
    skipAllowed: true,
  },
  {
    id: 'export',
    title: 'Download & Share',
    description:
      'Save your masterpiece in multiple formats, optimized for Instagram, Facebook, Twitter, and more.',
    skipAllowed: true,
  },
];

export interface OnboardingFlowProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  isOpen,
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = useCallback(() => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLastStep, onComplete]);

  const handlePrevious = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [isFirstStep]);

  const handleSkipAll = useCallback(() => {
    onSkip();
  }, [onSkip]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleSkipAll}
      size="md"
      showCloseButton={true}
      closeOnEscape={true}
      closeOnBackdropClick={false}
    >
      <div className="space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl">{step.image || '📘'}</div>
            <h2 className="text-xl font-bold text-white">{step.title}</h2>
          </div>
          <span className="text-xs font-semibold text-neutral-400 bg-neutral-800 px-2.5 py-1 rounded">
            {currentStep + 1} / {ONBOARDING_STEPS.length}
          </span>
        </div>

        {/* Description */}
        <p className="text-neutral-300 leading-relaxed">{step.description}</p>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all"
            style={{
              width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%`,
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-between">
          <div className="flex gap-3">
            {!isFirstStep && (
              <Button
                onClick={handlePrevious}
                variant="secondary"
                size="sm"
                icon={<Icon type="arrowLeft" />}
              >
                Previous
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            {step.skipAllowed && (
              <Button
                onClick={handleSkipAll}
                variant="secondary"
                size="sm"
              >
                Skip All
              </Button>
            )}
            <Button
              onClick={handleNext}
              variant="primary"
              size="sm"
              icon={isLastStep ? <Icon type="check" /> : <Icon type="arrowRight" />}
            >
              {isLastStep ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </div>

        {/* Tips */}
        <div className="pt-2 border-t border-neutral-800">
          <p className="text-xs text-neutral-500 italic">
            💡 Tip: You can replay this tutorial anytime from the settings menu.
          </p>
        </div>
      </div>
    </Modal>
  );
};

/**
 * Hook to manage onboarding state
 */
export const useOnboarding = () => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('onboarding_completed');
    return stored === 'true';
  });

  const completeOnboarding = useCallback(() => {
    setIsOnboardingComplete(true);
    localStorage.setItem('onboarding_completed', 'true');
  }, []);

  const resetOnboarding = useCallback(() => {
    setIsOnboardingComplete(false);
    localStorage.removeItem('onboarding_completed');
  }, []);

  return {
    isOnboardingComplete,
    completeOnboarding,
    resetOnboarding,
  };
};

export default OnboardingFlow;
