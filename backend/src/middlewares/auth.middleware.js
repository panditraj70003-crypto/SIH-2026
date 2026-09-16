const {verifyToken} = require("../utils/jwt");

const User = require("../modules/user/user.model");

const ApiError = require("../utils/ApiError");

const asyncHandler = require("./asyncHandler");

const authMiddleware = asyncHandler(async(req,res, next)=>{

    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        throw new ApiError(
            401,
            "Unauthorized"
        );
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id).select("-password");

    if(!user){
        throw new ApiError(
            401,
            "User not found"
        );
    }
    req.user = user;
    next();
});

module.exports = authMiddleware;