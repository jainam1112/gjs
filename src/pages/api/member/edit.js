import connectToDatabase from '../../../lib/mongodb';
import Member from '../../../models/Member';
import Family from '../../../models/Family';

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).end();

  const { memberId, name, phoneNumber, email, familyId } = req.body;

  await connectToDatabase();

  try {
    // Find the member to update
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Check if the familyId has changed
    if (familyId && familyId !== String(member.family)) {
      // Verify if the new family exists
      const newFamily = await Family.findOne({ familyId });
      if (!newFamily) {
        return res.status(404).json({ message: 'New family not found' });
      }

      // Remove the member from the old family's members list
      const oldFamily = await Family.findById(member.family);
      if (oldFamily) {
        oldFamily.members = oldFamily.members.filter(memberId => memberId.toString() !== member._id.toString());
        await oldFamily.save();
      }

      // Update member's family and add member to new family's members list
      member.family = newFamily._id;
      newFamily.members.push(member._id);
      await newFamily.save();
    }

    // Update member's details
    member.name = name;
    member.phoneNumber = phoneNumber;
    member.email = email;
    await member.save();

    res.status(200).json({ message: 'Member updated successfully', member });
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
