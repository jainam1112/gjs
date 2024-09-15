import connectToDatabase from '../../../lib/mongodb';
import Member from '../../../models/Member';

// Helper function to generate a random 7-digit number
function generateRandomSevenDigitNumber() {
  return Math.floor(1000000 + Math.random() * 9000000); // Generates a 7-digit random number
}

// Helper function to format the phone number
function generateDummyPhoneNumber() {
  const prefix = '600'; // Prefix with '000'
  const randomSevenDigits = generateRandomSevenDigitNumber();
  return `${prefix}${randomSevenDigits}`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  await connectToDatabase();

  try {
    let dummyPhoneNumber;
    let isUnique = false;

    // Keep generating until a unique phone number is found
    while (!isUnique) {
      dummyPhoneNumber = generateDummyPhoneNumber();
      
      // Check if the phone number already exists in the database
      const existingMember = await Member.findOne({ phoneNumber: dummyPhoneNumber });
      
      if (!existingMember) {
        isUnique = true; // Phone number is unique
      }
    }

    res.status(200).json({ dummyPhoneNumber });
  } catch (error) {
    console.error('Error generating dummy phone number:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
