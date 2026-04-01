import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { trackPageView } from './ga';

function RouteAnalyticsTracker() {
  const location = useLocation();
  const lastTrackedPathRef = useRef<string>('');

  useEffect(() => {
    const fullPath = `${location.pathname}${location.search}${location.hash}`;

    if (lastTrackedPathRef.current === fullPath) {
      return;
    }

    lastTrackedPathRef.current = fullPath;
    trackPageView(fullPath);
  }, [location.pathname, location.search, location.hash]);

  return null;
}

export default RouteAnalyticsTracker;
