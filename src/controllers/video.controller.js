import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  try {
    // TASK: check whether the fields aren't empty
    if ([title, description].some((field) => field.trim() === "")) {
      throw new ApiError(400, "Fields should not be empty.");
    }

    // TASK: fetch the path of the files
    const videoPath = req.files?.videoFile[0].path;
    const thumbnailPath = req.files?.thumbnail[0].path;

    if (!(videoPath && thumbnailPath)) {
      throw new ApiError(400, "files are required");
    }

    // TASK: upload on cloudinary, to get the file url
    const video = await uploadOnCloudinary(videoPath);
    const thumbnail = await uploadOnCloudinary(thumbnailPath);

    const { url: videoUrl, duration } = video;
    const { url } = thumbnail;
    if (!(videoUrl && url)) {
      throw new ApiError(500, "upload didn't take place properly");
    }

    // TASK: create a video object
    const videoDoc = await Video.create({
      videoFile: videoUrl,
      thumbnail: url,
      title: title,
      description: description,
      duration: duration,
      owner: req.user?._id,
    });

    if (!videoDoc) {
      throw new ApiError(400, "The video doc wasn't created successfully");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, videoDoc, "Video uploaded successfully."));
  } catch (error) {
    throw new ApiError(400, error?.message || "Couldn't publish the video.");
  }
});

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  try {
    // TASK: find the video in the database by the id
    const videoDoc = await Video.findById(videoId);
    if (!videoDoc) {
      throw new ApiError(404, "No video found with this id.");
    }

    // TASK: send the video doc to the user in response
    return res
      .status(200)
      .json(new ApiResponse(200, videoDoc, "Video found successfully."));
  } catch (error) {
    throw new ApiError(404, error?.message || "Unable to find the video");
  }
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  try {
    // TASK: check whether the thumbnail file is received or not through multer
    const thumbnailPath = req.file.path;
    if (!thumbnailPath) {
      throw new ApiError(400, "failed to fetch the local path.");
    }

    // TASK: upload the thumbnail in cloudinary and fetch the url
    const { url } = await uploadOnCloudinary(thumbnailPath);

    // TASK: get the video by the id and update
    const videoDoc = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: { thumbnail: url },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, videoDoc, "video updated successfully."));
  } catch (error) {
    throw new ApiError(400, "failed to update the video");
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  try {
    // TASK: get the video by the id and delete from the database
    await Video.findByIdAndDelete(videoId);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Video deleted successfully"));
  } catch (error) {
    throw new ApiError(400, "failed to delete the video");
  }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
