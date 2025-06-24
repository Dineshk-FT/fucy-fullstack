/*eslint-disable*/
import React from 'react';
import Joyride from 'react-joyride';

const AutoGuidePopper = ({ steps, runTour, setRunTour }) => {
  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if (['finished', 'skipped'].includes(status)) {
      setRunTour(false);
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
