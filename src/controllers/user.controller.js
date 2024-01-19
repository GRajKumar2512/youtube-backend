import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
  // TASK: get user details from frontend
  // TASK: validation - not empty
  // TASK: check if the usr already exist: username or email
  // TASK: check for images, check for avatar
  // TASK: upload them to cloudinary, avatar upload check
  // TASK: create user object
  // TASK: remove password and refresh token field from response
  // TASK: check for user creation
  // TASK: return response
});

export { registerUser };
