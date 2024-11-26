import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectToDatabase from '../lib/mongodb.mjs';
import Admin from '../models/Admin.js';
import Family from '../models/Family.js';
import Member from '../models/Member.js';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.local' });

async function setupDatabase() {
  try {
    // Connect to the MongoDB database
    await connectToDatabase();
    const db = mongoose.connection.db;

    // Check and create 'admins' collection
    const adminCollectionExists = (await db.listCollections({ name: 'admins' }).toArray()).length > 0;

    if (!adminCollectionExists) {
      console.log("Creating default admin user...");
    

      const hashedPassword = "admin" // Use proper salt rounds
      const newAdmin = new Admin({
        username: 'admin',
        password: hashedPassword,
      });

      try {
        await newAdmin.save();
        console.log('Default admin user created successfully!');
      } catch (err) {
        console.error('Error creating default admin user:', err);
        throw err;
      }
    } else {
      console.log('Admin collection already exists.');
    }

    // Check and create 'families' collection
    const familyCollectionExists = (await db.listCollections({ name: 'families' }).toArray()).length > 0;

    if (!familyCollectionExists) {
      console.log('Families collection will be created when a family is added.');
    } else {
      console.log('Families collection already exists.');
    }

    // Check and create 'members' collection
    const memberCollectionExists = (await db.listCollections({ name: 'members' }).toArray()).length > 0;

    if (!memberCollectionExists) {
      console.log('Members collection will be created when a member is added.');
    } else {
      console.log('Members collection already exists.');
    }

    // Exit successfully
    console.log('Database setup completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up the database:', error);
    process.exit(1);
  }
}

// Run the setup script
setupDatabase();
