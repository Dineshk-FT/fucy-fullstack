import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetError } from '../../store/slices/PageSectionSlice';

function MockErrorBoundary({ children }) {
  const dispatch = useDispatch();
  const { hasError } = useSelector((state) => state?.pageName);

  if (hasError) {
    // Customize your error message and UI here
    return (
      <div style={{ padding: '20px', backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', borderRadius: '4px' }}>
        <h2>Something went wrong.</h2>
        <p>We&apos;re sorry, but an unexpected error has occurred.</p> {/* Fixed the unescaped apostrophe */}
        <button
          onClick={() => dispatch(resetError())}
          style={{
            backgroundColor: '#f5c6cb',
            color: '#721c24',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return <div>{children}</div>;
}

export default MockErrorBoundary;
