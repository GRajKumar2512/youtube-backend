import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // TASK: get the token from the request
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    // TASK: decode the token to access the id of the user
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // TASK: find the user with this id in the database to verify
    const user = await User.findById(decodedToken._id).select(
      "-password refreshToken"
    );

    // TASK: check is the user exists
    if (!user) {
      throw new ApiError(401, "Invalid Access token");
    }

    // TASK: add the user object to the request and pass the control to next
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
