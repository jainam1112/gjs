import connectToDatabase from '../../../lib/mongodb';
import Member from '../../../models/Member';
import Family from '../../../models/Family';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, phoneNumber, email, password, familyId } = req.body;

  await connectToDatabase();

  try {
    // Ensure familyId is a number
    const familyIdNumber = Number(familyId);
    if (isNaN(familyIdNumber)) {
      return res.status(400).json({ message: 'Invalid family ID' });
    }

    // Check if the familyId exists
    const family = await Family.findOne({ familyId: familyIdNumber });
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }
console.log(family)
    // Create the new member
    const member = new Member({ name, phoneNumber, email, password, family: family._id });
    await member.save();

    // Add the member to the family's members list
    family.members.push(member._id);
    await family.save();

    res.status(201).json({ message: 'Member registered successfully', member });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
