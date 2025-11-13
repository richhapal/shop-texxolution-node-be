const express = require("express");
const { restrictTo } = require("../../middleware/auth");
const {
  getDashboardEnquiries,
  getEnquiryById,
  updateEnquiry,
  addCommunication,
  bulkUpdateEnquiries,
  getEnquiryStats,
} = require("../../controllers/dashboardEnquiryController");

const router = express.Router();

// ==================== ENQUIRY ROUTES ====================

/**
 * GET /api/dashboard/enquiries
 * Get all enquiries with filtering and pagination
 * Access: All authenticated users
 * Query params: page, limit, sort, status, assignedTo, priority, source, search, dateFrom, dateTo
 */
router.get("/", getDashboardEnquiries);

/**
 * GET /api/dashboard/enquiries/stats
 * Get enquiry statistics for dashboard
 * Access: All authenticated users
 */
router.get("/stats", getEnquiryStats);

/**
 * GET /api/dashboard/enquiries/:id
 * Get single enquiry details
 * Access: All authenticated users
 */
router.get("/:id", getEnquiryById);

/**
 * PATCH /api/dashboard/enquiries/:id
 * Update enquiry status, assignment, priority, or add internal note
 * Access: Admin, Editor
 * Body: { status?, assignedTo?, priority?, followUpDate?, internalNote? }
 */
router.patch("/:id", restrictTo("admin", "editor"), updateEnquiry);

/**
 * POST /api/dashboard/enquiries/:id/communication
 * Add communication record to enquiry
 * Access: Admin, Editor
 * Body: { type: 'email'|'phone'|'meeting'|'other', subject: string, content: string, direction: 'inbound'|'outbound' }
 */
router.post(
  "/:id/communication",
  restrictTo("admin", "editor"),
  addCommunication
);

// ==================== BULK OPERATIONS ====================

/**
 * PATCH /api/dashboard/enquiries/bulk
 * Bulk update enquiries
 * Access: Admin, Editor
 * Body: { enquiryIds: string[], updateData: object }
 */
router.patch("/bulk", restrictTo("admin", "editor"), bulkUpdateEnquiries);

module.exports = router;
