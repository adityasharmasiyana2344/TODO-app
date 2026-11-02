import mongoose from 'mongoose';
import { Todo } from '../models/Todo';
import { LocalTodoStorage } from '../storage/fileStore';

export interface DbState {
  isConnected: boolean;
  mode: 'mongodb' | 'embedded-persistent';
  uri: string;
  host: string;
  error?: string;
  placeholderDetected?: boolean;
  whitelistNotice?: string;
  notice?: string;
  lastChecked: string;
}

export const dbState: DbState = {
  isConnected: false,
  mode: 'embedded-persistent',
  uri: process.env.MONGODB_URI || '',
  host: 'local-disk-store',
  lastChecked: new Date().toISOString(),
};

function hasPlaceholderCredentials(uri: string): boolean {
  return /<[^>]+>/.test(uri) || uri.includes('username:password') || uri.includes('db_username') || uri.includes('db_password');
}

export async function connectDB(customUri?: string): Promise<boolean> {
  const uri = customUri || process.env.MONGODB_URI;

  if (!uri || !uri.trim()) {
    console.log('ℹ️ No MONGODB_URI provided. Running in Persistent Embedded Storage Mode (MongoDB document schema compliant).');
    dbState.isConnected = false;
    dbState.mode = 'embedded-persistent';
    dbState.host = 'local-disk-store';
    dbState.notice = 'No MONGODB_URI specified. Storing data in persistent local JSON store.';
    dbState.lastChecked = new Date().toISOString();
    return false;
  }

  // Detect unreplaced template placeholders like <db_username> or <db_password>
  if (hasPlaceholderCredentials(uri)) {
    console.log('ℹ️ MONGODB_URI contains placeholder credentials (<db_username>:<db_password>). Running in Persistent Embedded Storage Mode.');
    dbState.isConnected = false;
    dbState.mode = 'embedded-persistent';
    dbState.host = 'local-disk-store';
    dbState.uri = uri;
    dbState.placeholderDetected = true;
    dbState.notice = 'Your MONGODB_URI contains placeholder brackets like <db_username> or <db_password>. Replace them with your actual Atlas database credentials to connect to MongoDB Atlas.';
    dbState.lastChecked = new Date().toISOString();
    return false;
  }

  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }

    const safeUriDisplay = uri.replace(/:([^:@]+)@/, ':****@');
    console.log(`Connecting to MongoDB at: ${safeUriDisplay}...`);
    
    // Quick timeout to ensure the application never hangs
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3500,
      connectTimeoutMS: 3500,
    });

    dbState.isConnected = true;
    dbState.mode = 'mongodb';
    dbState.uri = uri;
    dbState.host = mongoose.connection.host || 'remote-cluster';
    dbState.lastChecked = new Date().toISOString();
    delete dbState.error;
    delete dbState.whitelistNotice;
    delete dbState.notice;
    dbState.placeholderDetected = false;

    console.log(`✅ MongoDB Connected Successfully: ${dbState.host}`);

    // If MongoDB is empty, seed from local storage to keep user experience seamless
    try {
      const count = await Todo.countDocuments();
      if (count === 0) {
        const seedItems = LocalTodoStorage.getAll();
        if (seedItems.length > 0) {
          console.log(`🌱 Seeding ${seedItems.length} initial todos into MongoDB collection...`);
          await Todo.insertMany(
            seedItems.map((item) => ({
              title: item.title,
              description: item.description,
              completed: item.completed,
              priority: item.priority,
              category: item.category,
              dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt),
            }))
          );
        }
      }
    } catch (seedErr) {
      console.log('Notice: Could not check or seed documents in MongoDB:', seedErr);
    }

    return true;
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.log(`ℹ️ MongoDB connection not active (${errMessage}). Switched seamlessly to Persistent Embedded Storage Mode.`);
    
    dbState.isConnected = false;
    dbState.mode = 'embedded-persistent';
    dbState.host = 'local-disk-store';
    dbState.error = errMessage;
    dbState.placeholderDetected = false;
    
    if (errMessage.includes('whitelist') || errMessage.includes('whitelisted') || errMessage.includes('access from an IP')) {
      dbState.whitelistNotice = 'MongoDB Atlas rejected connection: The current cloud environment IP is not on your Atlas IP Access List. In MongoDB Atlas, go to "Network Access" > "Add IP Address" and select "Allow Access From Anywhere" (0.0.0.0/0).';
    } else if (errMessage.includes('Authentication failed') || errMessage.includes('bad auth')) {
      dbState.notice = 'Authentication failed: Verify your database username and password in MongoDB Atlas > Database Access.';
    }

    dbState.lastChecked = new Date().toISOString();
    return false;
  }
}
