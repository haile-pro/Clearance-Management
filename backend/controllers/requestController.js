// controllers/requestController.js
const Request = require("../models/Request");
const User = require("../models/User");

exports.createRequest = [
  function(req, res, next) {
    req.upload.array('documents', 5)(req, res, function(err) {
      if (err) {
        return res.status(400).json({ message: "Error uploading files", error: err });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const { fullName, email, clearanceType, reason, description } = req.body;
      const documents = req.files ? req.files.map(file => ({
        filename: file.filename,
        path: `/uploads/${file.filename}`
      })) : [];

      if (!req.user || !req.user._id) {
        return res.status(401).json({ message: "Unauthorized: User not authenticated" });
      }

      const request = new Request({
        requester: req.user._id,
        fullName,
        email,
        clearanceType,
        reason,
        description,
        documents
      });

      await request.save();
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating request:", error);
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ message: "Validation error", errors: validationErrors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  }
]; 

exports.getRequests = async (req, res) => {
  try {
    const authenticatedUser = req.user;
    let requests;

    if (authenticatedUser.role === 'admin') {
      requests = await Request.find().populate("requester", "username");
    } else {
      requests = await Request.find({ requester: authenticatedUser._id }).populate("requester", "username");
    }

    res.json(requests);
  } catch (error) {
    console.error("Error getting requests:", error);
    res.status(500).json({ message: error.message });
  }
};
 
exports.getRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id).populate('requester', 'username');
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    res.json(request);
  } catch (error) {
    console.error("Error getting request:", error);
    res.status(500).json({ message: "Error getting request" });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewComment } = req.body;
    const request = await Request.findByIdAndUpdate(id, { status, reviewComment }, { new: true });
    res.json(request);
    console.log("Request status updated:", request);
  } catch (error) {
    console.error("Error updating request status:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findByIdAndDelete(id);
    res.json(request);
    console.log("Request deleted:", request);
  } catch (error) {
    console.error("Error deleting request:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const author = req.user._id;

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Clearance request not found" });
    }

    request.comments.push({ author, text });
    await request.save();

    res.status(201).json({ message: "Comment added successfully", comment: request.comments[request.comments.length - 1] });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Error adding comment" });
  }
};

exports.reviewRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewComment } = req.body;
    const reviewer = req.user._id;

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Clearance request not found" });
    }

    request.status = status;
    request.reviewComment = reviewComment;
    request.reviewer = reviewer;
    request.reviewedAt = new Date();

    await request.save();

    res.status(200).json({ message: "Request reviewed successfully", request });
  } catch (error) {
    console.error("Error reviewing request:", error);
    res.status(500).json({ message: "Error reviewing request" });
  }
};

exports.getUserDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const pendingRequests = await Request.countDocuments({ requester: userId, status: 'Pending' });
    const completedClearances = await Request.countDocuments({ requester: userId, status: 'Approved' });

    res.json({
      pendingRequests,
      completedClearances
    });
  } catch (error) {
    console.error("Error fetching user dashboard stats:", error);
    res.status(500).json({ message: "Error fetching user dashboard stats" });
  }
};

exports.getAdminDashboardStats = async (req, res) => {   
  try {
    const pendingRequests = await Request.countDocuments({ status: 'Pending' });
    const completedClearances = await Request.countDocuments({ status: 'Approved' });
    const totalRequests = await Request.countDocuments();
    const rejectedRequests = await Request.countDocuments({ status: 'Rejected' });
    const totalUsers = await User.countDocuments();

    // Calculate average processing time
    const completedRequests = await Request.find({ status: 'Approved' });
    const totalProcessingTime = completedRequests.reduce((sum, request) => {
      return sum + (request.reviewedAt ? request.reviewedAt - request.createdAt : 0);
    }, 0);
    const averageProcessingTime = completedRequests.length > 0 
      ? `${Math.round(totalProcessingTime / completedRequests.length / (1000 * 60 * 60 * 24))} days`
      : "N/A";

    const rejectionRate = totalRequests > 0 
      ? `${((rejectedRequests / totalRequests) * 100).toFixed(2)}%`
      : "0%";

    // Get requests by type
    const requestsByType = await Request.aggregate([
      { $group: { _id: "$clearanceType", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const requestsByTypeFormatted = requestsByType.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, {});

    // Get recent requests
    const recentRequests = await Request.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('requester clearanceType status createdAt')
      .populate('requester', 'fullName');

    const recentRequestsFormatted = recentRequests.map(request => ({
      id: request._id,
      requester: request.requester ? request.requester.fullName : 'Unknown',
      type: request.clearanceType,
      status: request.status,
      createdAt: request.createdAt
    }));

    res.json({
      pendingRequests,
      completedClearances,
      averageProcessingTime,
      rejectionRate,
      totalUsers,
      totalRequests,
      requestsByType: requestsByTypeFormatted,
      recentRequests: recentRequestsFormatted
    });
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    res.status(500).json({ message: "Error fetching admin dashboard stats" });
  }
}; 