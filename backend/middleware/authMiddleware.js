const jwt = require("jsonwebtoken");
const User = require("../models/User");


const auth = async (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided."});
 
    }      

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({message: "Invalid token. User not found."});   
        }
        req.user = user; 
        next();
    } catch (err) {
        console.error(("Error Verifying Token:", err)); 
        if (err.name === "TokenExpiredError") {
            return res.status(401).json( {message: "Token exprired", expired: true});
        }
        res.status(401).json({message: "Invalid token"}); 
    }
};
     

const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({message: "Access denied. Only admin users are allowed."});
    }
    next();
};

module.exports ={auth, authorizeAdmin};