import connectToDatabase from '../../../lib/mongodb';
import Member from '../../../models/Member';
import Family from '../../../models/Family'; // Ensure Family model is imported

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { loginIdentifier, password } = req.body;

  await connectToDatabase();

  try {
    // Find member by email or phone number
    const member = await Member.findOne({
      $or: [
        { email: loginIdentifier },
        { phoneNumber: loginIdentifier }
      ]
    }).populate('family'); // Ensure the 'family' field is populated

    if (!member || member.deleted) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await member.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Wrong Password' });
    }

    // Assuming familyId is available through member's family reference
    const familyId = member.family ? member.family.familyId : null;

    res.status(200).json({ message: 'Login successful', familyId, userId: member._id });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
