import mongoose, { ConnectOptions } from 'mongoose';

const connectToDatabase = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  await mongoose.connect('mongodb+srv://vercel-admin-user:4yxjz6OCe5JKgIom@cluster0.blponpo.mongodb.net/myFirstDatabase', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  } as ConnectOptions); // Add 'as ConnectOptions' to fix the type error
};

export { connectToDatabase };
