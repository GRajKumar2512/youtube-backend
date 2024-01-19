import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  // TASK: get user details from frontend
  const { fullname, email, username, password } = req.body;

  // TASK: validation - not empty
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // TASK: check if the usr already exist: username or email
  const existingUser = User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new ApiError(409, "user with email or username already exists");
  }

  // TASK: check for images, check for avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // TASK: upload them to cloudinary, avatar upload check
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  // TASK: create user object
  const userDoc = await User.create({
    username: username.toLowerCase(),
    email,
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    password,
  });

  // TASK: remove password and refresh token field from response
  const createdDoc = User.findById(userDoc._id).select(
    "-password -refreshToken"
  );

  // TASK: check for user creation
  if (!createdDoc) {
    throw new ApiError(500, "Something went wrong while creating the user");
  }

  // TASK: return response
  return res
    .status(201)
    .json(new ApiResponse(200, createdDoc, "User registered successfully !"));
});

export { registerUser };
