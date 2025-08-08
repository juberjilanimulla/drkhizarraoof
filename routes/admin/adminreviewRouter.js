import { Router } from "express";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";
import reviewmodel from "../../model/reviewmodel.js";

const adminreviewRouter = Router();

adminreviewRouter.post("/", getallreviewHandler);
adminreviewRouter.delete("/delete", deletereviewHandler);
export default adminreviewRouter;

async function getallreviewHandler(req, res) {
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
      const searchConditions = [
        { name: { $regex: searchRegex } },
        { mobile: { $regex: searchRegex } },
        { message: { $regex: searchRegex } },
      ];
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

    const review = await reviewmodel
      .find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    // Fetch total count for pagination
    const totalCount = await reviewmodel.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    // Respond with data
    successResponse(res, "Success", { review, totalPages });
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function deletereviewHandler(req, res) {
  try {
    const { _id } = req.body;
    if (!_id) {
      return errorResponse(res, 400, "some params are missing");
    }
    const checkexist = await reviewmodel.findById(_id);
    if (!checkexist) {
      return errorResponse(res, 404, "review not found in database ");
    }
    const review = await reviewmodel.findByIdAndDelete({ _id: _id });
    successResponse(res, "successfully deleted");
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
