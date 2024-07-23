import connectToDatabase from '../../../lib/mongodb';
import Member from '../../../models/Member';
import Family from '../../../models/Family';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { name, phoneNumber, email, password, familyId } = req.body;

  await connectToDatabase();

  try {
    const member = new Member({ name, phoneNumber, email, password, family: familyId });
    await member.save();

    const family = await Family.findById(familyId);
    family.members.push(member._id);
    await family.save();

    res.status(201).json({ message: 'Member added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}
