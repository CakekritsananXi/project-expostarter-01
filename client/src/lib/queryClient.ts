import { QueryClient } from '@tanstack/react-query';

// Create a query client with default configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

// API request helper function
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token'); // Changed from 'authToken' to 'token'
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP error! status: ${response.status}`);
  }

  // Handle empty responses
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
};

// Default query function that uses apiRequest
export const defaultQueryFn = async ({ queryKey }: { queryKey: readonly unknown[] }) => {
  const url = queryKey[0] as string;
  return apiRequest(url);
};

// Set the default query function for the query client
queryClient.setQueryDefaults([], {
  queryFn: defaultQueryFn,
});