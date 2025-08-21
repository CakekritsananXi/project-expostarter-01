import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export interface ToastActionElement {
  action: string;
  onClick: () => void;
}

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
  action?: ToastActionElement;
}

let toastId = 0;

// Global toast state
let toastSubscribers: ((toasts: Toast[]) => void)[] = [];
let globalToasts: Toast[] = [];

const notifySubscribers = () => {
  toastSubscribers.forEach(callback => callback([...globalToasts]));
};

const addToast = (toast: Omit<Toast, 'id'>) => {
  const id = (++toastId).toString();
  const newToast = { ...toast, id };
  globalToasts.push(newToast);
  notifySubscribers();

  // Auto remove toast after duration
  const duration = toast.duration ?? 5000;
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  return id;
};

const removeToast = (id: string) => {
  globalToasts = globalToasts.filter(toast => toast.id !== id);
  notifySubscribers();
};

const updateToast = (id: string, updates: Partial<Toast>) => {
  const index = globalToasts.findIndex(toast => toast.id === id);
  if (index !== -1) {
    globalToasts[index] = { ...globalToasts[index], ...updates };
    notifySubscribers();
  }
};

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>(globalToasts);

  // Subscribe to global toast updates
  useState(() => {
    const unsubscribe = () => {
      const index = toastSubscribers.indexOf(setToasts);
      if (index > -1) {
        toastSubscribers.splice(index, 1);
      }
    };

    toastSubscribers.push(setToasts);
    return unsubscribe;
  });

  const toast = useCallback((options: ToastOptions) => {
    return addToast(options);
  }, []);

  const dismiss = useCallback((toastId?: string) => {
    if (toastId) {
      removeToast(toastId);
    } else {
      // Remove all toasts
      globalToasts = [];
      notifySubscribers();
    }
  }, []);

  const update = useCallback((id: string, updates: Partial<Toast>) => {
    updateToast(id, updates);
  }, []);

  return {
    toast,
    dismiss,
    update,
    toasts,
  };
};

// Simple toast function for direct usage
export const toast = (options: ToastOptions) => {
  return addToast(options);
};