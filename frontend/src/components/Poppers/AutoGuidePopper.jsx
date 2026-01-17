/*eslint-disable*/
import React from 'react';
import Joyride, { STATUS } from 'react-joyride';

/* ===============================
   CUSTOM TOOLTIP (SAFE)
   =============================== */
const JoyrideTooltip = ({ continuous, index, step, backProps, primaryProps, skipProps, tooltipProps }) => {
  return (
    <div
      {...tooltipProps}
      onClick={(e) => e.stopPropagation()} // 🔥 prevent bubbling
      style={{
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
        padding: 16,
        maxWidth: 320
      }}
    >
      {/* Title */}
      {step.title && <h4 style={{ margin: '0 0 8px', fontSize: 16 }}>{step.title}</h4>}

      {/* Content */}
      <div style={{ fontSize: 14 }}>{step.content}</div>

      {/* Footer buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
          marginTop: 14
        }}
      >
        {skipProps && (
          <button
            {...skipProps}
            onClick={(e) => {
              e.stopPropagation();
              skipProps.onClick(e);
            }}
            style={buttonStyle}
          >
            Skip
          </button>
        )}

        {continuous && (
          <button
            {...primaryProps}
            onClick={(e) => {
              e.stopPropagation();
              primaryProps.onClick(e);
            }}
            style={{ ...buttonStyle, background: '#1976d2', color: '#fff' }}
          >
            {index === step.total - 1 ? 'Finish' : 'Next'}
          </button>
        )}
      </div>
    </div>
  );
};

const buttonStyle = {
  padding: '6px 12px',
  borderRadius: 6,
  border: 'none',
  cursor: 'pointer',
  background: '#e0e0e0',
  fontSize: 13
};

/* ===============================
   MAIN COMPONENT
   =============================== */
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
    const { status, step, type } = data;

    // ✅ Tour finished or skipped
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      return;
    }

    // ✅ Scroll horizontally when step activates
    if (type === 'step:before' && step?.target) {
      const targetEl = document.querySelector(step.target);
      if (!targetEl) return;

      const container = findScrollableParent(targetEl);
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();

      if (targetRect.right > containerRect.right || targetRect.left < containerRect.left) {
        container.scrollTo({
          left: container.scrollLeft + (targetRect.left - containerRect.left) - 50,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <Joyride
      steps={steps}
      run={runTour}
      continuous
      scrollToFirstStep={false}
      disableOverlayClose
      disableScrolling
      spotlightPadding={8}
      showProgress
      showSkipButton
      tooltipComponent={JoyrideTooltip} // 🔥 KEY FIX
      callback={handleJoyrideCallback}
      styles={{
        options: {
          zIndex: 1600
        }
      }}
    />
  );
};

export default React.memo(AutoGuidePopper);
