import { Router } from "express";
import doctormodel from "../../model/doctormodel.js";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";

const admindoctorRouter = Router();

admindoctorRouter.post("/", getalldoctorHandler);

export default admindoctorRouter;

async function getalldoctorHandler(req, res) {
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
        { firstname: { $regex: searchRegex } },
        { lastname: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { mobile: { $regex: searchRegex } },
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

    const doctor = await doctormodel
      .find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    // Fetch total count for pagination
    const totalCount = await doctormodel.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    // Respond with data
    successResponse(res, "Success", { doctor, totalPages });
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
