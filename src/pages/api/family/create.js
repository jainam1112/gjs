import connectToDatabase from '../../../lib/mongodb';
import Family from '../../../models/Family';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { familyName } = req.body;

  await connectToDatabase();

  try {
    const family = new Family({ familyName });
    await family.save();
    res.status(201).json({ message: 'Family created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}
