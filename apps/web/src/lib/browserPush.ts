import wsLink from "@lensshare/lens/apollo/wsLink";

let browserPushWorker: Worker;

if (typeof Worker !== 'undefined') {
  browserPushWorker = new Worker(
    new URL('./browserPushWorker', import.meta.url)
  );
}
export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered with scope:', registration.scope);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

export const subscribeUserToPush = async (): Promise<PushSubscription | null> => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'BJIols6nTonpJYlHcYzTUKY6BTzsZG6DSWJkVlKNWbgQoMVeSDBEeJcQC4J6AU8mvX21n4PCGoYFwAdeYv4Omn0'
    });
    await fetch('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ subscription })
    });
    return subscription;
  }
  return null;
};



export const subscribeToLensNotifications = (callback: (arg0: any) => void) => {
  const socket = new WebSocket(wsLink.client.toString());

  socket.onmessage = (event) => {
    const notification = JSON.parse(event.data);
    callback(notification);
  };

  return () => socket.close();
};
/**
 * 
 * Browser push notification
 */
export const BrowserPush = {
  notify: ({ title }: { title: string }) => {
    browserPushWorker.postMessage({ title });

    browserPushWorker.onmessage = (event: MessageEvent) => {
      if (!('Notification' in window)) {
        return;
      }

      const response = event.data;
      new Notification('MyCrumbs', {
        body: response.title,
        icon: '/logo.png'
      });
    };
  }
};
