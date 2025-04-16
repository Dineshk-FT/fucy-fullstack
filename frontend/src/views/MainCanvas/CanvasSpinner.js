import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * CanvasSpinner - Optimized spinner overlay for canvas drag events.
 * Props:
 *   open: boolean - Whether the spinner is visible
 *   isDark: boolean - Dark mode flag
 */
export default function CanvasSpinner({ open, isDark }) {
  return (
    <>
      <div
        className={open ? 'canvas-spinner-overlay open' : 'canvas-spinner-overlay'}
        aria-live="polite"
        aria-busy={open}
        tabIndex={-1}
      >
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
        }}>

          <CircularProgress size={100} thickness={5.5} color="primary" sx={{ zIndex: 1, mb: 1 }} />
          <Typography className="canvas-spinner-text" sx={{ mt: 3 }}>
            Moving node
            <span className="canvas-spinner-ellipsis">...</span>
          </Typography>
        </Box>
      </div>
      <style>{`
        .canvas-spinner-overlay {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(30,32,36,0.32);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          opacity: 0;
          pointer-events: none;
          transition: opacity 220ms cubic-bezier(.4,0,.2,1);
        }
        .canvas-spinner-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }
        .canvas-spinner-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          transform: scale(0.98);
          transition: opacity 200ms, transform 200ms;
          background: var(--spinner-bg, rgba(255,255,255,0.95));
          border-radius: 20px;
          box-shadow: 0 12px 36px 0 rgba(31,38,135,0.28);
          min-width: 320px;
          padding: 40px 48px 32px 48px;
          opacity: 0.98;
        }
        .canvas-spinner-card.dragging {
          opacity: 1;
          transform: scale(1);
        }

        .canvas-spinner-text {
          color: ${isDark ? '#fff' : '#111'};
          font-weight: 700;
          font-size: 22px;
          letter-spacing: 0.5px;
          user-select: none;
          z-index: 1;
          display: flex;
          align-items: center;
          text-shadow: ${isDark ? '0 2px 10px #0006' : '0 2px 10px #2196F355'};
          animation: canvas-spinner-pulseText 1.1s infinite alternate;
        }
        .canvas-spinner-ellipsis {
          display: inline-block;
          width: 32px;
          margin-left: 2px;
          text-align: left;
          animation: canvas-spinner-ellipsis 1.2s infinite steps(4);
          font-weight: 700;
        }
        @keyframes canvas-spinner-spin {
          100% { transform: translateX(-50%) rotate(360deg); }
        }
        @keyframes canvas-spinner-ellipsis {
          0% { width: 0 }
          100% { width: 32px }
        }
        @keyframes canvas-spinner-pulseText {
          0% { opacity: 1; }
          100% { opacity: 0.7; }
        }
      `}</style>
    </>
  );
}
