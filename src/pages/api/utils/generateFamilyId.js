import connectToDatabase from '../../../lib/mongodb';
import Family from '../../../models/Family';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { familyName } = req.body;

  await connectToDatabase();

  try {
    if (!familyName || typeof familyName !== 'string') {
      return res.status(400).json({ message: 'Invalid Primary name provided.' });
    }

    // Extract the first letter of the family name (capitalized)
    const familyPrefix = familyName.charAt(0).toUpperCase();

    // Find the highest familyId that starts with the same prefix (e.g., "S001", "S002", ...)
    const lastFamily = await Family.findOne({ familyId: { $regex: `^${familyPrefix}\\d{3}$` } })
      .sort({ familyId: -1 })
      .exec();

    // Generate the next serial number
    let newSerialNumber = 1;

    if (lastFamily) {
      const lastSerialNumber = parseInt(lastFamily.familyId.slice(1), 10); // Extract number part (e.g., "001" -> 1)
      newSerialNumber = lastSerialNumber + 1;
    }

    // Ensure the new serial number is within the valid range (000 to 999)
    if (newSerialNumber > 999) {
      return res.status(400).json({ message: 'Family ID limit reached for this prefix' });
    }

    // Format the new familyId (e.g., "S001", "S002", etc.)
    const newFamilyId = `${familyPrefix}${newSerialNumber.toString().padStart(3, '0')}`;


    res.status(201).json({ message: 'Family Id created successfully', familyId: newFamilyId });
  } catch (error) {
    console.error('Error creating family:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
