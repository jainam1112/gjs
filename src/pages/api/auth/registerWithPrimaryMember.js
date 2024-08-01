import connectToDatabase from '../../../lib/mongodb';
import Family from '../../../models/Family';
import Member from '../../../models/Member';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { familyName, name, phoneNumber, email, password, dateOfBirth, gender } = req.body;

  await connectToDatabase();

  try {
    // Find the family with the highest familyId
    const lastFamily = await Family.findOne().sort({ familyId: -1 }).exec();
    let newFamilyId = 1000; // Start with 1000 if no family exists

    if (lastFamily) {
      newFamilyId = lastFamily.familyId + 1;

      // Ensure the familyId is a 4-digit number
      if (newFamilyId > 9999) {
        return res.status(400).json({ message: 'Family ID limit reached' });
      }
    }

    // Check if the phone number already exists
    const existingMember = await Member.findOne({ phoneNumber });
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
      familyId: newFamilyId,
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
