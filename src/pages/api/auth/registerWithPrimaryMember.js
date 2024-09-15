import connectToDatabase from '../../../lib/mongodb';
import Family from '../../../models/Family';
import Member from '../../../models/Member';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { familyId, familyName, name, phoneNumber, email, password, dateOfBirth, gender } = req.body;

  await connectToDatabase();

  try {
    // Check if the familyId is provided and is within the allowed range
    if (!familyId || familyId < 1000 || familyId > 9999) {
      return res.status(400).json({ message: 'Invalid family ID. Must be a 4-digit number between 1000 and 9999.' });
    }

    // Check if the familyId already exists
    const existingFamily = await Family.findOne({ familyId }).exec();
    if (existingFamily) {
      return res.status(400).json({ message: `Family ID ${familyId} is already in use. Please choose a different ID.` });
    }

    // Check if the phone number already exists (excluding deleted members)
    const existingMember = await Member.findOne({ phoneNumber, deleted: false });
    if (existingMember) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    // Create the primary member
    const primaryMember = new Member({
      name,
      phoneNumber,
      email,
      password,
      dateOfBirth,
      gender,
      family: "60c289e8ae500b001fcd06f2", // Temporary family reference, will be updated
    });

    await primaryMember.save();

    // Create the new family
    const newFamily = new Family({
      familyId,  // Use the familyId provided by the user
      familyName,
      members: [primaryMember._id],
      primaryMember: primaryMember._id,
    });

    // Update the primary member's family reference
    primaryMember.family = newFamily._id;
    await primaryMember.save();
    await newFamily.save();

    res.status(201).json({ message: 'Family and primary member created successfully', family: newFamily, primaryMember });
  } catch (error) {
    console.error('Error creating family:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
