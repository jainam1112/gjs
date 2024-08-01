// src/pages/api/auth/admin-login.js

import connectToDatabase from '../../../lib/mongodb';
import Admin from '../../../models/Admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;

  await connectToDatabase();

  try {
    console.log(email)
    const admin = await Admin.findOne({ username:email });
    console.log(admin)
    if (!admin || admin.deleted) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Wrong Password' });
    }

    res.status(200).json({ message: 'Login successful', userId: admin._id });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
