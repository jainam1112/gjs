import connectToDatabase from '../../../lib/mongodb';
import Family from '../../../models/Family';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  await connectToDatabase();

  try {
    const families = await Family.find();
    res.status(200).json({ families });
  } catch (error) {
    console.error('Error fetching families:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
