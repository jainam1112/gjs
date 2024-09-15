import connectToDatabase from '../../../lib/mongodb';
import Family from '../../../models/Family';
import Member from '../../../models/Member';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { familyId } = req.query;

  await connectToDatabase();

  try {
    // Find the family by familyId
    const family = await Family.findOne({ familyId });
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }

    // Find members associated with the found family
    const members = await Member.find({ family: family._id});
    res.status(200).json({ family, members });
  } catch (error) {
    console.error('Error fetching members by familyId:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
