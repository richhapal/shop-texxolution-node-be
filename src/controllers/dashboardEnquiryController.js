/* eslint-disable consistent-return */
const Enquiry = require('../models/Enquiry');
const User = require('../models/User');

/**
 * Get all enquiries for dashboard with filtering and pagination
 */
const getDashboardEnquiries = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
      status,
      assignedTo,
      priority,
      source,
      search,
      dateFrom,
      dateTo,
    } = req.query;

    // Build filter object
    const filter = {};

    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (priority) filter.priority = priority;
    if (source) filter.source = source;

    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Search filter
    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { enquiryNo: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort object
    const sortObj = {};
    if (sort) {
      const sortFields = sort.split(',');
      sortFields.forEach(field => {
        if (field.startsWith('-')) {
          sortObj[field.slice(1)] = -1;
        } else {
          sortObj[field] = 1;
        }
      });
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Execute query
    const [enquiries, total] = await Promise.all([
      Enquiry.find(filter)
        .populate('assignedTo', 'name email')
        .populate('products.productId', 'name sku category')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Enquiry.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNumber);

    res.json({
      success: true,
      message: 'Enquiries retrieved successfully.',
      data: {
        enquiries,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalEnquiries: total,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1,
          limit: limitNumber,
        },
      },
    });
  } catch (error) {
    console.error('Get dashboard enquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving enquiries.',
    });
  }
};

/**
 * Get single enquiry details
 */
const getEnquiryById = async (req, res) => {
  try {
    const { id } = req.params;

    const enquiry = await Enquiry.findById(id)
      .populate('assignedTo', 'name email department')
      .populate(
        'products.productId',
        'name sku category images.main pricing.basePrice',
      )
      .populate('internalNotes.addedBy', 'name email')
      .populate('communications.handledBy', 'name email')
      .lean();

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found.',
      });
    }

    res.json({
      success: true,
      message: 'Enquiry retrieved successfully.',
      data: {
        enquiry,
      },
    });
  } catch (error) {
    console.error('Get enquiry by ID error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid enquiry ID format.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving enquiry.',
    });
  }
};

/**
 * Update enquiry status or assign to user
 */
const updateEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, priority, followUpDate, internalNote } =
      req.body;

    const enquiry = await Enquiry.findById(id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found.',
      });
    }

    // Update status if provided
    if (status) {
      const validStatuses = ['new', 'in_review', 'approved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message:
            'Invalid status. Must be one of: new, in_review, approved, rejected',
        });
      }
      enquiry.status = status;
    }

    // Update assignment if provided
    if (assignedTo) {
      // Verify user exists
      const user = await User.findById(assignedTo);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user not found.',
        });
      }
      enquiry.assignedTo = assignedTo;

      // Auto-update status to in_review if it was new
      if (enquiry.status === 'new') {
        enquiry.status = 'in_review';
      }
    }

    // Update priority if provided
    if (priority) {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message:
            'Invalid priority. Must be one of: low, medium, high, urgent',
        });
      }
      enquiry.priority = priority;
    }

    // Update follow-up date if provided
    if (followUpDate) {
      enquiry.followUpDate = new Date(followUpDate);
    }

    // Add internal note if provided
    if (internalNote && internalNote.trim()) {
      enquiry.internalNotes.push({
        note: internalNote.trim(),
        addedBy: req.user._id,
      });
    }

    await enquiry.save();

    // Populate for response
    await enquiry.populate('assignedTo', 'name email');

    res.json({
      success: true,
      message: 'Enquiry updated successfully.',
      data: {
        enquiry,
      },
    });
  } catch (error) {
    console.error('Update enquiry error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid enquiry ID format.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while updating enquiry.',
    });
  }
};

/**
 * Add communication to enquiry
 */
const addCommunication = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, subject, content, direction } = req.body;

    if (!type || !subject || !content || !direction) {
      return res.status(400).json({
        success: false,
        message: 'Type, subject, content, and direction are required.',
      });
    }

    const validTypes = ['email', 'phone', 'meeting', 'other'];
    const validDirections = ['inbound', 'outbound'];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be one of: email, phone, meeting, other',
      });
    }

    if (!validDirections.includes(direction)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid direction. Must be one of: inbound, outbound',
      });
    }

    const enquiry = await Enquiry.findById(id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found.',
      });
    }

    const communication = {
      type,
      subject: subject.trim(),
      content: content.trim(),
      direction,
      handledBy: req.user._id,
    };

    enquiry.communications.push(communication);
    await enquiry.save();

    // Populate the newly added communication
    await enquiry.populate('communications.handledBy', 'name email');

    res.json({
      success: true,
      message: 'Communication added successfully.',
      data: {
        communication:
          enquiry.communications[enquiry.communications.length - 1],
      },
    });
  } catch (error) {
    console.error('Add communication error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while adding communication.',
    });
  }
};

/**
 * Bulk update enquiries
 */
const bulkUpdateEnquiries = async (req, res) => {
  try {
    const { enquiryIds, updateData } = req.body;

    if (!enquiryIds || !Array.isArray(enquiryIds) || enquiryIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Enquiry IDs array is required.',
      });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Update data is required.',
      });
    }

    // Validate assignedTo if provided
    if (updateData.assignedTo) {
      const user = await User.findById(updateData.assignedTo);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user not found.',
        });
      }
    }

    const result = await Enquiry.updateMany(
      { _id: { $in: enquiryIds } },
      updateData,
      { runValidators: true },
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} enquiries updated successfully.`,
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error('Bulk update enquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during bulk update.',
    });
  }
};

/**
 * Get enquiry statistics for dashboard
 */
const getEnquiryStats = async (req, res) => {
  try {
    const [
      totalEnquiries,
      enquiriesByStatus,
      enquiriesByPriority,
      enquiriesBySource,
      overdueEnquiries,
      recentEnquiries,
      topAssignees,
    ] = await Promise.all([
      Enquiry.countDocuments(),
      Enquiry.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Enquiry.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Enquiry.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }]),
      Enquiry.countDocuments({
        followUpDate: { $lt: new Date() },
        status: 'in_review',
      }),
      Enquiry.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('enquiryNo customerName company status priority createdAt')
        .populate('assignedTo', 'name'),
      Enquiry.aggregate([
        { $match: { assignedTo: { $exists: true } } },
        { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            _id: 0,
            userId: '$_id',
            name: '$user.name',
            email: '$user.email',
            count: 1,
          },
        },
      ]),
    ]);

    res.json({
      success: true,
      message: 'Enquiry statistics retrieved successfully.',
      data: {
        total: totalEnquiries,
        byStatus: enquiriesByStatus,
        byPriority: enquiriesByPriority,
        bySource: enquiriesBySource,
        overdue: overdueEnquiries,
        recent: recentEnquiries,
        topAssignees,
      },
    });
  } catch (error) {
    console.error('Get enquiry stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving statistics.',
    });
  }
};

module.exports = {
  getDashboardEnquiries,
  getEnquiryById,
  updateEnquiry,
  addCommunication,
  bulkUpdateEnquiries,
  getEnquiryStats,
};
