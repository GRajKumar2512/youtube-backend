import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { response } from "express";

const createTweet = asyncHandler(async (req, res) => {
  // TODO: create tweet
  const { content } = req.body;
  const user = req.user;
  console.log(req.body);

  try {
    const tweet = await Tweet.create({
      content: content,
      owner: user._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, tweet, "Tweet created successfully."));
  } catch (error) {
    throw new ApiError(500, error?.message || "Something went wrong.");
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;

  try {
    const userTweet = await Tweet.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      },
    ]);

    res
      .status(200)
      .json(new ApiResponse(200, userTweet, "Tweets fetched successfully."));
  } catch (error) {
    throw new ApiResponse(200);
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  // TODO: update tweet
  const { content } = req.body;
  const { tweetId } = req.params;

  try {
    const updatedTweet = await Tweet.findByIdAndUpdate(
      tweetId,
      { $set: { content: content } },
      { new: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully."));
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong while updating tweets."
    );
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  // TODO: delete tweet
  const { tweetId } = req.params;
  try {
    await Tweet.findByIdAndDelete(tweetId);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Tweet got deleted successful."));
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong while deleting tweet."
    );
  }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
