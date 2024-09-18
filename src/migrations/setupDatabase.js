// migrations/setupDatabase.js
import mongoose from 'mongoose';
import connectToDatabase from '../lib/mongodb'; // Your MongoDB connection logic
import Admin from '../models/Admin'; // Import Admin model
import Family from '../models/Family'; // Import Family model
import Member from '../models/Member'; // Import Member model
import bcrypt from 'bcryptjs';

async function setupDatabase() {
  try {
    // Connect to the MongoDB database
    await connectToDatabase();
    const db = mongoose.connection.db;

    // Check if 'admins' collection exists, if not, it will be created
    const adminCollectionExists = (await db.listCollections({ name: 'admins' }).toArray()).length > 0;
    
    if (!adminCollectionExists) {
      // Ensure an Admin user exists
      const hashedPassword = await bcrypt.hash('admin', 12345); // Hash the default password
      const newAdmin = new Admin({
        username: 'admin',
        password: hashedPassword, // Store hashed password
      });
      
      await newAdmin.save();
      console.log('Admin collection and default admin user created successfully!');
    } else {
      console.log('Admin collection already exists!');
    }

    // Check if 'families' collection exists
    const familyCollectionExists = (await db.listCollections({ name: 'families' }).toArray()).length > 0;
    
    if (!familyCollectionExists) {
      // Ensure a default family is created
      console.log('Families collection and default family created successfully!');
    } else {
      console.log('Families collection already exists!');
    }

    // Check if 'members' collection exists
    const memberCollectionExists = (await db.listCollections({ name: 'members' }).toArray()).length > 0;
    
    if (!memberCollectionExists) {
      // You can add members if needed
      console.log('Members collection is ready, no default members were added.');
    } else {
      console.log('Members collection already exists!');
    }

    // Exit the process once the setup is complete
    process.exit(0);
  } catch (error) {
    console.error('Error setting up the database:', error);
    process.exit(1); // Exit with an error status
  }
}

// Run the setup
setupDatabase();
