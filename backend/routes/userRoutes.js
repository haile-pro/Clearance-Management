// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getUsers, deleteUser, getCurrentUser } = require('../controllers/userController');
const { auth, authorizeAdmin } = require('../middleware/authMiddleware');

router.get('/', auth, authorizeAdmin, getUsers);
router.delete('/:id', auth, authorizeAdmin, deleteUser);
router.get('/me', auth, getCurrentUser);

module.exports = router;