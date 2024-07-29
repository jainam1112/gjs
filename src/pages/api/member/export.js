import connectToDatabase from '../../../lib/mongodb';
import Member from '../../../models/Member';
import { parse } from 'json2csv';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  await connectToDatabase();

  try {
    // Prepare filter object based on the provided query
    const { deleted } = req.query;
    const filterObj = {};

    if (deleted) {
      filterObj.deleted = true;
    } else {
      filterObj.deleted = { $ne: true };
    }

    // Query members
    const members = await Member.find(filterObj)
      .populate('family') // Populate the 'family' field from the Member model

   
      // Generate CSV data with the required fields
      const csv = parse(members.map(member => ({
        familyId: member.family.familyId,
        name: member.name,
        familyName: member.family.familyName,
        phoneNumber: member.phoneNumber,
        email: member.email,
      })));

      // Set response headers
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=members.csv');
      res.status(200).send(csv);
   
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
