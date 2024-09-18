import connectToDatabase from '../../../lib/mongodb';
import Member from '../../../models/Member';
import Family from '../../../models/Family'; // Import Family model

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  await connectToDatabase();

  try {
    // Extract query parameters
    const { page = 1, limit = 10, sortBy = 'name', filter, q, deleted } = req.query;
    const search = q;
    const skip = (parseInt(page) - 1) * parseInt(limit);
  
    const regex = /(?:^|\s)-\w+/g;
    const matches = sortBy.match(regex);
    const sortDirection = matches ? -1 : 1;
    const newsortBy = matches ? sortBy.slice(1) : sortBy;
   
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

    // Get total count of members that match the filter
    const totalMembers = await Member.countDocuments(filterObj);

    // Query members with pagination, sorting, and optional filtering
    const members = await Member.find(filterObj)
      .populate({
        path: 'family',
        select: ['familyId', 'familyName'], // Select only the fields needed for sorting
      })
      .sort({ [newsortBy]: sortDirection }) // Sort by ascending order of the specified field
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    // Get total count of families
    const totalFamilies = await Family.countDocuments(); // This will return the total number of families

    // Populate family details and sort by family fields if needed
    if (['familyId', 'familyName'].includes(sortBy)) {
      const membersWithFamily = await Promise.all(members.map(async (member) => {
        const family = await Family.findById(member.family._id).select(['familyId', 'familyName']);
        return { ...member.toObject(), family: { ...family.toObject() } };
      }));
      membersWithFamily.sort((a, b) => {
        if (sortBy === 'familyId') {
          return (a.family.familyId - b.family.familyId) * sortDirection;
        }
        if (sortBy === 'familyName') {
          return (a.family.familyName.localeCompare(b.family.familyName)) * sortDirection;
        }
        return 0;
      });
      res.status(200).json({ members: membersWithFamily, totalMembers, totalFamilies });
    } else {
      res.status(200).json({ members, totalMembers, totalFamilies });
    }
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
