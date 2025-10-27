import React, { useState, useEffect } from 'react';
import Button from './common/Button';
import Icon from './common/Icon';
import { getTutorialService, TUTORIAL_STEPS } from '../services/tutorialService';
import { TutorialState } from '../types';

interface TutorialOverlayProps {
  enabled: boolean;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ enabled }) => {
  const [tutorialState, setTutorialState] = useState<TutorialState | null>(null);
  const tutorialService = getTutorialService();

  useEffect(() => {
    if (enabled) {
      setTutorialState(tutorialService.getState());
      const unsubscribe = tutorialService.subscribe((state) => setTutorialState(state));
      return unsubscribe;
    }
  }, [enabled, tutorialService]);

  if (!tutorialState?.isActive || !tutorialState.shouldShowIntroduction) return null;

  const currentStep = tutorialState.currentStep;
  const stepContent = tutorialService.getStepContent(currentStep);
  const stepIndex = TUTORIAL_STEPS.indexOf(currentStep);
  const isLastStep = stepIndex === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    tutorialService.nextStep();
  };

  const handlePrevious = () => {
    tutorialService.previousStep();
  };

  const handleSkip = () => {
    tutorialService.dismiss();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl max-w-md w-full border border-primary-500/30 shadow-2xl">
        <div className="p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <span className="text-3xl">{stepIndex + 1}</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">{stepContent.title}</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">{stepContent.description}</p>

          <div className="flex gap-2 mb-6">
            {TUTORIAL_STEPS.map((step, index) => (
              <div
                key={step}
                className={index <= stepIndex ? 'h-1.5 rounded-full flex-1 bg-primary-500' : 'h-1.5 rounded-full flex-1 bg-gray-700'}
              />
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex gap-3">
              {stepIndex > 0 && (
                <Button
                  onClick={handlePrevious}
                  variant="secondary"
                  className="flex-1"
                  icon={<Icon type="chevronLeft" className="w-4 h-4" />}
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                variant="primary"
                className={stepIndex > 0 ? 'flex-1' : 'w-full'}
                icon={isLastStep ? <Icon type="check" className="w-4 h-4" /> : <Icon type="chevronRight" className="w-4 h-4" />}
              >
                {isLastStep ? 'Finish' : 'Next'}
              </Button>
            </div>
            <button
              onClick={handleSkip}
              className="w-full text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              Skip Tutorial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
