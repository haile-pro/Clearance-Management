const express = require('express');
const { 
  createRequest, 
  getRequests, 
  getRequest, 
  updateRequestStatus, 
  deleteRequest, 
  getUserDashboardStats,
  getAdminDashboardStats,
  addComment, 
  reviewRequest
} = require('../controllers/requestController');
const { auth, authorizeAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', auth, createRequest);
router.get('/', auth, getRequests);
router.get('/user-stats', auth, getUserDashboardStats);
router.get('/admin-stats', auth, authorizeAdmin, getAdminDashboardStats);
router.get('/:id', auth, getRequest);
router.put('/:id', auth, authorizeAdmin, updateRequestStatus);
router.delete('/:id', auth, authorizeAdmin, deleteRequest);
router.post('/:id/comments', auth, addComment);
router.post('/:id/review', auth, authorizeAdmin, reviewRequest);

module.exports = router;