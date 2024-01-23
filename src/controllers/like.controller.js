import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  try {
    const likedVideo = await Like.findOne({
      video: videoId,
      likedBy: req.user?._id,
    });

    if (!likedVideo) {
      const createDoc = await Like.create({
        video: videoId,
        likedBy: req.user?._id,
      });
      return res
        .status(200)
        .json(new ApiResponse(200, createDoc, "liked successfully"));
    } else {
      const deleteDoc = await Like.findOneAndDelete({
        video: videoId,
        likedBy: req.user?._id,
      });
      return res
        .status(200)
        .json(new ApiResponse(200, deleteDoc, "disliked successfully"));
    }
  } catch (error) {
    throw new ApiError(400, "failed to toggle like on video");
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  try {
    const condition = { comment: commentId, likedBy: req.user?._id };
    const likedComment = await Like.findOne(condition);

    if (!likedComment) {
      const createDoc = await Like.create(condition);
      return res
        .status(200)
        .json(new ApiResponse(200, createDoc, "liked comment successfully"));
    } else {
      const deleteDoc = await Like.findOneAndDelete(condition);
      return res
        .status(200)
        .json(new ApiResponse(200, deleteDoc, "disliked comment successfully"));
    }
  } catch (error) {
    throw new ApiError(400, "failed to toggle like on comment");
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  try {
    const condition = { tweet: tweetId, likedBy: req.user?._id };
    const likedTweet = await Like.findOne(condition);

    if (!likedTweet) {
      const createDoc = await Like.create(condition);
      return res
        .status(200)
        .json(new ApiResponse(200, createDoc, "liked tweet successfully"));
    } else {
      const deleteDoc = await Like.findOneAndDelete(condition);
      return res
        .status(200)
        .json(new ApiResponse(200, deleteDoc, "disliked tweet successfully"));
    }
  } catch (error) {
    throw new ApiError(400, "failed to toggle like on tweet");
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  try {
    const likedVideos = await Like.aggregate([
      {
        $match: {
          likedBy: req.user?._id,
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "likedVideo",
        },
      },
      {
        $project: {
          _id: 0,
          likedVideo: "$likedVideo",
        },
      },
      {
        $addFields: {
          likedVideo: {
            $first: "$likedVideo",
          },
        },
      },
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfully.")
      );
  } catch (error) {
    throw new ApiError(400, "failed to fetch likes on this video");
  }
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
