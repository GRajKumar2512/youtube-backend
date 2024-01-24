import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const owner = req.user?._id;
  //TODO: create playlist
  try {
    if (!name && !description) {
      throw new ApiError(404, "both name and description are required fields");
    }

    const playlistDoc = await Playlist.create({
      name: name,
      description: description,
      owner: owner,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, playlistDoc, "Playlist created successfully.")
      );
  } catch (error) {
    throw new ApiError(400, error?.message || "Unable to create a playlist.");
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  try {
    // TASK: fetch the playlist document
    const playlistDoc = await Playlist.find({ owner: userId });

    // CHECK:
    if (!playlistDoc)
      throw new ApiError(404, "No playlist found with this user ID.");

    return res
      .status(200)
      .json(
        new ApiResponse(200, playlistDoc, "User playlist fetched successfully.")
      );
  } catch (error) {
    throw new ApiError(
      400,
      error?.message || "Unable to fetch the user playlist"
    );
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  try {
    // TASK: fetch the playlist document
    const playlistDoc = await Playlist.findById(playlistId);

    // CHECK:
    if (!playlistDoc)
      throw new ApiError(404, "No playlist found with this ID.");

    return res
      .status(200)
      .json(
        new ApiResponse(200, playlistDoc, "Playlist fetched successfully.")
      );
  } catch (error) {
    throw new ApiError(
      400,
      error?.message || "Unable to fetch playlist with ID."
    );
  }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  try {
    // TASK: fetch the playlist document
    const playlist = await Playlist.findById(playlistId);

    // CHECK:
    if (!playlist) throw new ApiError(404, "No playlist found with this id.");

    // CHECK:
    if (playlist.videos.includes(videoId)) {
      throw new ApiError(400, "Video already present in the playlist.");
    }

    // TASK: add video to the playlist
    playlist.videos.push(videoId);

    // TASK: save the changes
    await playlist.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          playlist,
          "Video Added to the playlist successfully."
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Failed to add video to playlist."
    );
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  try {
    // TASK: fetch the playlist document
    const playlist = await Playlist.findById(playlistId);

    // CHECK:
    if (!playlist) throw new ApiError(404, "No playlist found with this id.");

    // CHECK:
    if (!playlist.videos.includes(videoId)) {
      throw new ApiError(400, "No video with this id present to be removed.");
    }

    // TASK: remove the video from the playlist
    playlist.videos.pop(videoId);

    // TASK: save the changes
    await playlist.save();

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Video removed from the playlist."));
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Failed to remove video from playlist."
    );
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  try {
    await Playlist.findByIdAndDelete(playlistId);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Delete playlist successful."));
  } catch (error) {
    throw new ApiError(500, error?.message || "Failed to delete playlist.");
  }
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  try {
    // TASK: update the playlist
    const updateDoc = await Playlist.findByIdAndUpdate(
      playlistId,
      { name: name, description: description },
      { new: true }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, updateDoc, "Update playlist details successful")
      );
  } catch (error) {
    throw new ApiResponse(
      500,
      error?.message || "Failed to update playlist details."
    );
  }
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
