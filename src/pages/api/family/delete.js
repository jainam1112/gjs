import connectToDatabase from '../../../lib/mongodb';
import Member from '../../../models/Member';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).end();

  const { memberId } = req.body;

  await connectToDatabase();

  try {
    const member = await Member.findByIdAndUpdate(memberId, { deleted: true }, { new: true });

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.status(200).json({ message: 'Member deleted successfully', member });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}