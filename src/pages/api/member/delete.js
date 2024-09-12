import connectToDatabase from '../../../lib/mongodb';
import Member from '../../../models/Member';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end(); // Only allow DELETE requests

  const { memberId } = req.body;

  await connectToDatabase();

  try {
    const member = await Member.findByIdAndDelete(memberId); // Permanently delete the member

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.status(200).json({ message: 'Member permanently deleted successfully', member });
  } catch (error) {
    console.error('Error permanently deleting member:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
