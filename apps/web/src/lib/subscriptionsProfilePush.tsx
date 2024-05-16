import mongoose, { Document, Schema } from 'mongoose';

interface ISubscription extends Document {
  endpoint: string;
  expirationTime: Date | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

const subscriptionSchema: Schema = new Schema({
  endpoint: { type: String, required: true },
  expirationTime: { type: Date, required: false },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true }
  }
});

export default mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', subscriptionSchema);
