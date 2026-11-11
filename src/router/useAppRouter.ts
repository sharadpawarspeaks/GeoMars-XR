import { useState, useEffect, useCallback } from 'react';
import type { TabType } from '../types/mars';

export type AppRoutePath =
  | '/'
  | '/explore'
  | '/route-planner'
  | '/terrain-lab'
  | '/mission-data'
  | '/missions'
  | '/about';

const BASE_PREFIX = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');

function stripBase(pathname: string): string {
  if (BASE_PREFIX && BASE_PREFIX !== '/' && pathname.startsWith(BASE_PREFIX)) {
    const rest = pathname.slice(BASE_PREFIX.length);
    return rest || '/';
  }
  return pathname;
}

function addBase(route: AppRoutePath): string {
  if (!BASE_PREFIX || BASE_PREFIX === '/') return route;
  return route === '/' ? `${BASE_PREFIX}/` : `${BASE_PREFIX}${route}`;
}

export function normalizePath(path: string): AppRoutePath {
  const clean = stripBase(path).replace(/\/+$/, '') || '/';
  if (clean === '/xr') return '/explore';
  if (
    clean === '/' ||
    clean === '/explore' ||
    clean === '/route-planner' ||
    clean === '/terrain-lab' ||
    clean === '/mission-data' ||
    clean === '/missions' ||
    clean === '/about'
  ) {
    return clean;
  }
  return '/';
}

export function routeToTab(path: AppRoutePath): TabType {
  switch (path) {
    case '/':
      return 'home';
    case '/explore':
      return 'map';
    case '/route-planner':
      return 'route';
    case '/terrain-lab':
      return 'terrain';
    case '/mission-data':
      return 'science';
    case '/missions':
      return 'missions';
    case '/about':
      return 'about';
  }
}

export function tabToRoute(tab: TabType): AppRoutePath {
  switch (tab) {
    case 'home':
      return '/';
    case 'map':
      return '/explore';
    case 'route':
      return '/route-planner';
    case 'terrain':
      return '/terrain-lab';
    case 'science':
      return '/mission-data';
    case 'missions':
      return '/missions';
    case 'about':
      return '/about';
  }
}

export function useAppRouter() {
  const [currentPath, setCurrentPath] = useState<AppRoutePath>(() =>
    normalizePath(window.location.pathname)
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(normalizePath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: string) => {
    const nextPath = normalizePath(to);
    const fullUrl = addBase(nextPath);
    if (nextPath !== currentPath) {
      window.history.pushState({}, '', fullUrl);
      setCurrentPath(nextPath);
    }
  }, [currentPath]);

  const activeTab = routeToTab(currentPath);

  return { currentPath, activeTab, navigate };
}
