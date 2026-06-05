/*eslint-disable*/
import { useState, useCallback } from 'react';

const useTableLoading = (initialLoading = false) => {
  const [loading, setLoading] = useState(initialLoading);
  const [loadingConfig, setLoadingConfig] = useState({
    variant: 'skeleton',
    rowsCount: 5,
    message: 'Loading data...'
  });

  const startLoading = useCallback((config = {}) => {
    setLoadingConfig((prev) => ({ ...prev, ...config }));
    setLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);

  const withLoading = useCallback(
    async (callback, config = {}) => {
      startLoading(config);
      try {
        const result = await callback();
        return result;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  return {
    loading,
    loadingConfig,
    startLoading,
    stopLoading,
    withLoading
  };
};

export default useTableLoading;
