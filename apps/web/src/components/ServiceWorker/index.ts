import { useEffect, type FC } from 'react';
import { useEffectOnce } from 'usehooks-ts';

const SW: FC = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      (navigator.serviceWorker as ServiceWorkerContainer)
        .register('/sw.js', { scope: '/' })
        .catch(console.error);
    }
  }, []);

 

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/notification/service-worker.js').then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      }).catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
    }
  }, []);

  return null;
};

export default SW;
