import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/backend', // Use the Next.js proxy
});


interface UseProcessManagerReturn {
  loading: boolean;
  error: string | null;
  previewUrl: string;
  updateFiles: (fullResponse: string) => Promise<void>;
}

export function useProcessManager(): UseProcessManagerReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Fetch the stable preview URL once on mount
  useEffect(() => {
    const fetchPreviewUrl = async () => {
      try {
        const response = await apiClient.get('/preview/url');
        setPreviewUrl(response.data.url);
      } catch (err) {
        const errorMessage = 'Could not fetch the preview server URL. Is the backend running?';
        setError(errorMessage);
        console.error(errorMessage, err);
      }
    };
    fetchPreviewUrl();
  }, []);

  const updateFiles = useCallback(async (fullResponse: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post('/files/update', { fullResponse });
      // Since the preview is always on, we might want to force a refresh
      // on the iframe to ensure the latest changes are visible immediately.
      setPreviewUrl(prevUrl => {
        const url = new URL(prevUrl);
        url.searchParams.set('t', Date.now().toString());
        return url.toString();
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.details || err.message || 'An unknown error occurred.';
      setError(errorMessage);
      console.error('Failed to update files:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    previewUrl,
    updateFiles,
  };
}