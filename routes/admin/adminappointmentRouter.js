import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import appointmentmodel from "../../model/appointmentmodel.js";

const adminappointmentRouter = Router();

adminappointmentRouter.post("/getall", getallappointmentHandler);

export default adminappointmentRouter;

async function getallappointmentHandler(req, res) {
  try {
    const { pageno = 0, filterBy = {}, sortby = {}, search = "" } = req.body;
    const limit = 10;
    const skip = pageno * limit;

    let query = { $and: [] };

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
      const searchRegex = new RegExp("\\b" + search.trim(), "i");
      const searchConditions = [
        { patientname: { $regex: searchRegex } },
        { patientemail: { $regex: searchRegex } },
        { patientmobile: { $regex: searchRegex } },
      ];
      query.$and.push({ $or: searchConditions });
    }

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
        : { createdAt: -1 };

    // Aggregation pipeline with pagination
    const appointment = await appointmentmodel
      .find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalCount = await appointmentmodel.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    successResponse(res, "Success", { appointment, totalPages });
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
