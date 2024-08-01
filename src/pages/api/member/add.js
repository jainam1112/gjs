import connectToDatabase from '../../../lib/mongodb';
import Member from '../../../models/Member';
import Family from '../../../models/Family';
import bcrypt from 'bcryptjs';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, phoneNumber, email, password, familyId, dateOfBirth, gender } = req.body;

  await connectToDatabase();

  try {
    // Validate if the family exists
    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }

    // Create a new member
    const member = new Member({ name, phoneNumber, email, password, family: family._id, dateOfBirth, gender });
    await member.save();

    // Add the member to the family's members list
    family.members.push(member._id);
    await family.save();

    res.status(201).json({ message: 'Member added successfully', member });
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
