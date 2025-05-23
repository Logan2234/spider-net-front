const DEFAULT_TIMEOUT = 5000;
const DEFAULT_TYPE = 'info';

const DEFAULT_TITLES: Record<NotificationType, string> = {
  info: 'Information',
  success: 'Success',
  error: 'Error',
  warning: 'Warning'
};

import { writable, type Subscriber, type Unsubscriber } from 'svelte/store';

export type NotificationType = 'info' | 'success' | 'error' | 'warning';
export type NotificationPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  title: string;
  timeout?: number;
}

export interface NotificationStore {
  subscribe: (
    run: Subscriber<Notification[]>,
    invalidate?: (() => void) | undefined
  ) => Unsubscriber;
  showNotification: (
    message: string,
    type: NotificationType,
    timeout?: number,
    title?: string
  ) => void;
  close: (id: string) => void;
}

function createNotificationStore(): NotificationStore {
  const notifications = writable<Notification[]>([]);

  function addNotification(
    message: string,
    type: NotificationType = DEFAULT_TYPE,
    timeout?: number,
    title?: string
  ) {
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      message,
      type,
      title: title || DEFAULT_TITLES[type],
      timeout: timeout || DEFAULT_TIMEOUT
    };

    notifications.update((notifications) => [...notifications, newNotification]);
  }

  function close(id: string) {
    notifications.update((notifications) =>
      notifications.filter((notification) => notification.id !== id)
    );
  }

  return { showNotification: addNotification, close, subscribe: notifications.subscribe };
}

export default createNotificationStore();
