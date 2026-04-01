type GtagCommand = 'config' | 'event' | 'js';

type Gtag = (command: GtagCommand, target: string | Date, params?: Record<string, unknown>) => void;

declare global {
  interface Window {
    gtag?: Gtag;
  }
}

const GA_MEASUREMENT_ID = 'G-7R4CWTBN3M';

function isGtagReady() {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

export function trackPageView(path: string) {
  if (!isGtagReady()) {
    return;
  }

  window.gtag?.('config', GA_MEASUREMENT_ID, {
    page_path: path,
  });
}
