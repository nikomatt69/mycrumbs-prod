import { connectToDatabase } from '@lib/mogodb';
import { NextApiRequest, NextApiResponse } from 'next';
import Subscription from 'src/lib/subscriptionsProfilePush';


export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { subscription } = req.body;
    await connectToDatabase();
    const newSubscription = new Subscription(subscription);
    await newSubscription.save();
    res.status(201).json({ message: 'Subscription saved.' });
  } else {
    res.status(405).end();
  }
};
