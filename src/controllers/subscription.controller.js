import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  try {
    // TASK: check if the user is already subscribed or not to the channel
    const conditions = { subscriber: req.user?._id, channel: channelId };
    const subscriptionStatus = await Subscription.findOne(conditions);

    if (!subscriptionStatus) {
      const createSubscription = await Subscription.create(conditions);
      return res
        .status(200)
        .json(new ApiResponse(200, createSubscription, "subscribed"));
    } else {
      const deleteSubscription = await Subscription.findOneAndDelete(
        conditions
      );
      return res
        .status(200)
        .json(new ApiResponse(200, deleteSubscription, "unsubscribed"));
    }
  } catch (error) {
    throw new ApiError(
      400,
      error?.message || "Something went wrong while toggling subscription."
    );
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  try {
    const userSubscribers = await Subscription.aggregate([
      {
        $match: {
          channel: new mongoose.Types.ObjectId(channelId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "subscriber",
          foreignField: "_id",
          as: "subscriber",
        },
      },
      {
        $unwind: "$subscriber",
      },
      {
        $project: {
          "subscriber._id": 1,
          "subscriber.username": 1,
          "subscriber.fullname": 1,
        },
      },
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          userSubscribers,
          "Subscribers count fetched successfully."
        )
      );
  } catch (error) {
    throw new ApiError(
      400,
      error?.message || "Something went wrong while fetching subscribers."
    );
  }
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  try {
    const subscribedChannels = await Subscription.aggregate([
      {
        $match: {
          subscriber: new mongoose.Types.ObjectId(subscriberId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "channel",
          foreignField: "_id",
          as: "channel",
        },
      },
      {
        $unwind: "$channel",
      },
      {
        $project: {
          "channel._id": 1,
          "channel.username": 1,
          "channel.fullname": 1,
        },
      },
    ]);

    console.log(subscribedChannels);

    return res
      .status(200)
      .json(new ApiResponse(200, subscribedChannels, "success"));
  } catch (error) {
    throw new ApiError(400, error?.message || "Unable to find the channels");
  }
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
