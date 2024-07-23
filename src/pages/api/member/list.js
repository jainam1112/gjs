// pages/api/members/fetchmembers.js

import connectToDatabase from '../../../lib/mongodb';
import Member from '../../../models/Member';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  await connectToDatabase();

  try {
    // Extract query parameters
    const { page = 1, limit = 10, sortBy = 'name', filter, search, deleted } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Prepare filter object based on the provided query
    const filterObj = {};
    const searchConditions = [];

    if (filter) {
      searchConditions.push(
        { name: { $regex: filter, $options: 'i' } }, // Case-insensitive regex search for name
        { email: { $regex: filter, $options: 'i' } } // Case-insensitive regex search for email
      );
    }

    if (search) {
      searchConditions.push(
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      );
    }

    if (searchConditions.length > 0) {
      filterObj.$or = searchConditions;
    }

    if (deleted) {
      filterObj.deleted = true;
    } else {
      filterObj.deleted = { $ne: true };
    }

    // Query members with pagination, sorting, and optional filtering
    const members = await Member.find(filterObj)
      .populate('family') // Populate the 'family' field from the Member model
      .sort({ [sortBy]: 1 }) // Sort by ascending order of the specified field
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({ members });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
