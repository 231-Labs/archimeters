// components/Toast.tsx
'use client';

import { useEffect } from 'react';

export default function Toast({
  message,
  show,
  duration = 3000,
  onClose,
}: {
  message: string;
  show: boolean;
  duration?: number;
  onClose: () => void;
}) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  return show ? (
    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-50">
      {message}
    </div>
  ) : null;
}
