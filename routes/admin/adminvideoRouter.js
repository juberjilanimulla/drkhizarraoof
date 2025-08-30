import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import videomodel from "../../model/videomodel.js";

const adminvideoRouter = Router();
adminvideoRouter.post("/getall", getallvideoHandler);
adminvideoRouter.post("/create", createvideoHandler);
adminvideoRouter.put("/update", updatevideoHandler);
adminvideoRouter.delete("/delete", deletevideoHandler);
adminvideoRouter.post("/published", publihsedvideoHandler);

export default adminvideoRouter;

async function getallvideoHandler(req, res) {
  try {
    const { pageno = 0, filterBy = {}, sortby = {}, search = "" } = req.body;
    const limit = 10;
    const skip = pageno * limit;

    let query = {};

    // Apply search
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { src: { $regex: searchRegex } },
      ];
    }

    // Apply filters
    if (filterBy && Object.keys(filterBy).length > 0) {
      query = {
        ...query,
        ...filterBy,
      };
    }

    // Sorting logic
    const sortBy =
      Object.keys(sortby).length !== 0
        ? Object.keys(sortby).reduce((acc, key) => {
            acc[key] = sortby[key] === "asc" ? 1 : -1;
            return acc;
          }, {})
        : { createdAt: -1 };

    // Fetch paginated blogs
    const video = await videomodel
      .find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    const totalCount = await videomodel.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    successResponse(res, "successfully", {
      video,
      totalPages,
    });
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function createvideoHandler(req, res) {
  try {
    const { title, description, src } = req.body;
    if (!title || !description || !src) {
      return errorResponse(res, 400, "some params are missing");
    }
    const params = { title, description, src };
    const video = await videomodel.create(params);

    successResponse(res, "success", video);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function updatevideoHandler(req, res) {
  try {
    const { _id, ...updatedData } = req.body;
    if (!_id) {
      return errorResponse(res, 400, "slot booking ID (_id) is required");
    }

    const existingvideo = await videomodel.findById(_id);
    if (!existingvideo) {
      return errorResponse(res, 404, "slotbooking is not exist");
    }

    const options = { new: true };
    if (!updatedData.title || !updatedData.description || !updatedData.src) {
      errorResponse(res, 404, "Some params are missing");
      return;
    }
    const video = await videomodel.findByIdAndUpdate(_id, updatedData, options);
    successResponse(res, "successfully updated", video);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function deletevideoHandler(req, res) {
  try {
    const { _id } = req.body;
    if (!_id) {
      return errorResponse(res, 400, "some params are missing");
    }
    const checkexist = await videomodel.findById(_id);
    if (!checkexist) {
      return errorResponse(res, 404, "videos not found in database ");
    }
    const video = await videomodel.findByIdAndDelete({ _id: _id });
    successResponse(res, "successfully deleted");
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function publihsedvideoHandler(req, res) {
  try {
    const { published, videoid } = req.body;

    if (!videoid) {
      return errorResponse(res, 400, "video ID is missing in URL params");
    }

    const existingvideo = await videomodel.findById({ _id: videoid });
    if (!existingvideo) {
      return errorResponse(res, 404, "video not found");
    }

    if (typeof published !== "boolean") {
      return errorResponse(
        res,
        400,
        "Published must be a boolean (true/false)"
      );
    }

    const updatedVideo = await videomodel.findByIdAndUpdate(
      videoid,
      { published },
      { new: true }
    );

    if (!updatedVideo) {
      return errorResponse(res, 404, "video not found");
    }

    return successResponse(
      res,
      "Video approval status updated successfully",
      updatedVideo
    );
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
