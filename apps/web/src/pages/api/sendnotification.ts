import { connectToDatabase } from '@lib/mogodb';
import { NextApiRequest, NextApiResponse } from 'next';
import Subscription from 'src/lib/subscriptionsProfilePush';
import webPush from 'web-push';


webPush.setVapidDetails(
  'mailto:nikoemme@skiff.com',
  'BJIols6nTonpJYlHcYzTUKY6BTzsZG6DSWJkVlKNWbgQoMVeSDBEeJcQC4J6AU8mvX21n4PCGoYFwAdeYv4Omn0',
  'UDOTP5Chz31w4IF-iBdjoEpulGM1ZlEn2C0UeR68ZB8'
);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    await connectToDatabase();
    const subscriptions = await Subscription.find();

    const notificationPayload = {
      title: 'Notification Title',
      body: 'Notification Body',
      icon: '/icon.png'
    };

    const sendPromises = subscriptions.map(subscription => 
      webPush.sendNotification(subscription, JSON.stringify(notificationPayload))
    );

    await Promise.all(sendPromises);
    res.status(200).json({ message: 'Notifications sent.' });
  } else {
    res.status(405).end();
  }
};
