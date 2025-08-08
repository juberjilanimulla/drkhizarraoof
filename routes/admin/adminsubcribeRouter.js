import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import subcribemodel from "../../model/subcribemodel.js";

const adminsubcribeRouter = Router();

adminsubcribeRouter.post("/", getallsubcribeHandler);
adminsubcribeRouter.delete("/delete", deletesubcribeHandler);
export default adminsubcribeRouter;

async function getallsubcribeHandler(req, res) {
  try {
    const { pageno = 0, filterBy = {}, sortby = {}, search = "" } = req.body;

    const limit = 10; // Number of items per page
    const skip = pageno * limit;

    // Base query for job applicants
    let query = {
      $and: [],
    };

    // Apply filters
    if (filterBy) {
      Object.keys(filterBy).forEach((key) => {
        if (filterBy[key] !== undefined) {
          query.$and.push({ [key]: filterBy[key] });
        }
      });
    }

    // Apply search
    if (search.trim()) {
      // const searchRegex = new RegExp(search.trim(), "i");
      const searchRegex = new RegExp("\\b" + search.trim(), "i");
      const searchConditions = [{ email: { $regex: searchRegex } }];
      query.$and.push({ $or: searchConditions });
    }

    // If no filters or search applied, use an empty object for the query
    if (query.$and.length === 0) {
      query = {};
    }

    // Apply sorting
    const sortBy =
      Object.keys(sortby).length !== 0
        ? Object.keys(sortby).reduce((acc, key) => {
            acc[key] = sortby[key] === "asc" ? 1 : -1;
            return acc;
          }, {})
        : { createdAt: -1 }; // Default sorting by most recent doctors

    const subcribe = await subcribemodel
      .find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    // Fetch total count for pagination
    const totalCount = await subcribemodel.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    // Respond with data
    successResponse(res, "Success", { subcribe, totalPages });
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function deletesubcribeHandler(req, res) {
  try {
    const { _id } = req.body;
    if (!_id) {
      return errorResponse(res, 400, "some params are missing");
    }
    const checkexist = await subcribemodel.findById({ _id: _id });

    if (!checkexist) {
      return errorResponse(res, 404, "subcribe id is not exist ");
    }
    const subcribe = await subcribemodel.findByIdAndDelete(_id);

    successResponse(res, "success");
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
