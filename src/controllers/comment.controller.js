import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  try {
    const aggregateQuery = Comment.aggregate({
      video: new mongoose.Types.ObjectId(videoId),
    });

    await Comment.aggregatePaginate(
      aggregateQuery,
      {
        page: page,
        limit: limit,
        sort: { createdAt: -1 },
        customLabels: { docs: "comments", totalDocs: "totalComments" },
      },
      function (error, result) {
        if (error) {
          throw new ApiError(
            400,
            error?.message || "Something went wrong in pipeline process"
          );
        } else {
          return res
            .status(200)
            .json(
              new ApiResponse(200, result, "All comments fetched successfully.")
            );
        }
      }
    );
  } catch (error) {
    throw new ApiError(400, error?.message || "Failed to fetch the comments");
  }
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  try {
    // TASK: fetch all the important payload
    const { content } = req.body;
    const user = req.user?._id;
    const { videoId } = req.params;

    // TASK: get the comment document and upload the details
    const commentDoc = await Comment.create({
      content: content,
      video: videoId,
      owner: user,
    });

    // TASK: return the response
    return res
      .status(200)
      .json(new ApiResponse(200, commentDoc, "Add comment successful."));
  } catch (error) {
    throw new ApiError(400, error?.message || "Failed to add comment.");
  }
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  try {
    // TASK: get the payload
    const { content } = req.body;
    const { commentId } = req.params;

    // TASK: update the content in the comment
    const updateDoc = await Comment.findByIdAndUpdate(
      commentId,
      { content: content },
      { new: true }
    );

    // TASK: return the response
    return res
      .status(200)
      .json(new ApiResponse(200, updateDoc, "Update comment successful."));
  } catch (error) {
    throw new ApiError(400, error?.message || "Failed to update comment.");
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  try {
    // TASK: get the commentId from the url
    const { commentId } = req.params;

    // TASK: delete the document from the database
    const deleteDoc = await Comment.findByIdAndDelete(commentId);

    // TASK: return the response
    return res
      .status(200)
      .json(new ApiResponse(200, deleteDoc, "Delete comment successful."));
  } catch (error) {
    throw new ApiError(400, error?.message || "Failed to delete comment.");
  }
});

export { getVideoComments, addComment, updateComment, deleteComment };
