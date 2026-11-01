import { useState, useEffect, useCallback } from 'react';

export type AppRoute = 
  | '/'
  | '/explore'
  | '/route-planner'
  | '/terrain-lab'
  | '/mission-data'
  | '/about';

export function normalizePath(path: string): AppRoute {
  const clean = path.split('?')[0].replace(/\/$/, '') || '/';
  if (clean === '/explore') return '/explore';
  if (clean === '/route-planner' || clean === '/route') return '/route-planner';
  if (clean === '/terrain-lab' || clean === '/terrain') return '/terrain-lab';
  if (clean === '/mission-data' || clean === '/science' || clean === '/missions') return '/mission-data';
  if (clean === '/about') return '/about';
  return '/';
}

export function useAppRouter() {
  const [currentPath, setCurrentPath] = useState<AppRoute>(() => 
    normalizePath(typeof window !== 'undefined' ? window.location.pathname : '/')
  );
  const [queryParams, setQueryParams] = useState<URLSearchParams>(() => 
    new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(normalizePath(window.location.pathname));
      setQueryParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((path: AppRoute | string, params?: Record<string, string>) => {
    let url = path;
    if (params) {
      const search = new URLSearchParams(params).toString();
      if (search) url += `?${search}`;
    }

    if (window.location.pathname + window.location.search !== url) {
      window.history.pushState(null, '', url);
    }
    
    setCurrentPath(normalizePath(path));
    setQueryParams(new URLSearchParams(url.includes('?') ? url.split('?')[1] : ''));
    
    // Scroll to top on page transitions
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    currentPath,
    queryParams,
    navigate
  };
}

