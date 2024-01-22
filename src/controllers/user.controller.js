import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // this adds the new refreshToken to the user model and saves in without validation
    // cause we every the data saves in the database then password is required, but we want to save without password
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

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
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new ApiError(409, "user with email or username already exists");
  }

  // TASK: check for images, check for avatar
  const avatarLocalPath = req.files?.avatar[0]?.path; // here the req.files is provided by multer middleware
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

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
  const createdDoc = await User.findById(userDoc._id).select(
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

const loginUser = asyncHandler(async (req, res) => {
  // TASK: get data from req.body
  const { username, email, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "username or email is required !");
  }

  // TASK: username or email based search
  const userDoc = await User.findOne({ $or: [{ username }, { email }] });
  if (!userDoc) {
    throw new ApiError(404, "User not found !");
  }

  // TASK: password check
  const isPasswordValid = await userDoc.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // TASK: access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    userDoc._id
  );

  // OPTIONAL-TASK: removing certain fields before sending the data to the client
  const LoggedInUser = await User.findById(userDoc._id).select(
    "-password -refreshToken"
  );

  // TASK: send cookie
  res
    .status(200)
    .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
    .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
    .json(
      new ApiResponse(
        200,
        { user: LoggedInUser, accessToken, refreshToken },
        "User logged in successfully !"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // TASK: remove the refresh token from the database
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", { httpOnly: true, secure: true })
    .clearCookie("refreshToken", { httpOnly: true, secure: true })
    .json(new ApiResponse(200, {}, "User logged out successfully !"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request !");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token !");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used.");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    res
      .status(200)
      .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
      .cookie("refreshToken", newRefreshToken, { httpOnly: true, secure: true })
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully."
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresf token");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
