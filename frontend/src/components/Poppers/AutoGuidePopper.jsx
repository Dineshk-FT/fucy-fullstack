/*eslint-disable*/
import React from 'react';
import Joyride from 'react-joyride';

const AutoGuidePopper = ({ steps, runTour, setRunTour }) => {
  const findScrollableParent = (el) => {
    let parent = el.parentElement;
    while (parent) {
      const overflowX = getComputedStyle(parent).overflowX;
      if (overflowX === 'auto' || overflowX === 'scroll') {
        return parent;
      }
      parent = parent.parentElement;
    }
    return null;
  };

  const handleJoyrideCallback = (data) => {
    const { status, action, step, index, type } = data;

    // When tour ends
    if (['finished', 'skipped'].includes(status)) {
      setRunTour(false);
    }

    // When a step becomes active
    if (type === 'step:before') {
      const targetEl = document.querySelector(step.target);
      if (targetEl) {
        const container = findScrollableParent(targetEl);

        if (container) {
          const containerRect = container.getBoundingClientRect();
          const targetRect = targetEl.getBoundingClientRect();

          const isOverflowingRight = targetRect.right > containerRect.right;
          const isOverflowingLeft = targetRect.left < containerRect.left;

          if (isOverflowingRight || isOverflowingLeft) {
            container.scrollTo({
              left: container.scrollLeft + (targetRect.left - containerRect.left) - 50, // padding or adjustment
              behavior: 'smooth'
            });
          }
        }
      }
    }
  };

  return (
    <>
      <Joyride
        steps={steps}
        run={runTour}
        continuous
        scrollToFirstStep={false}
        spotlightPadding={8}
        disableScrollParentFix={true}
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            zIndex: 1300,
            beacon: {
              backgroundColor: '#1976d2',
              borderRadius: '50%',
              width: 20,
              height: 20,
              animation: 'pulse 1.5s infinite'
            }
          }
        }}
        disableOverlayClose
        disableScrolling
      />
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.3); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </>
  );
};

export default React.memo(AutoGuidePopper);
