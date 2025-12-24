'use client';

import { useEffect } from 'react';
import { initializeWebVitals } from '@/lib/monitoring/metrics';

export default function WebVitalsReporter() {
  useEffect(() => {
    initializeWebVitals();
  }, []);

  return null;
}
