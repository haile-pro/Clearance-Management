// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log(`Connecting to MongoDB at ${process.env.MONGO_URI}`);
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // 5 seconds
    });
    console.log(`MongoDB connected to database ${mongoose.connection.name}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error}`);
    // Consider retrying the connection or handling the error in a more robust way
    // For example:
    // setTimeout(connectDB, 5000); // Retry after 5 seconds
  }
};      

module.exports = connectDB;
 