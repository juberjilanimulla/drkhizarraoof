import { Router } from "express";
import doctormodel from "../../model/doctormodel.js";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";

const admindoctorRouter = Router();

admindoctorRouter.post("/", getalldoctorHandler);
admindoctorRouter.post("/create", createdoctorHandler);
admindoctorRouter.put("/update", updatedoctorHandler);
admindoctorRouter.delete("/delete", deletedoctorHandler);
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

async function createdoctorHandler(req, res) {
  try {
    const { firstname, lastname, email, mobile, specialization } = req.body;
    if (!firstname || !lastname || !email || !mobile) {
      return errorResponse(res, 400, "some params are missing");
    }
    const params = { firstname, lastname, email, mobile, specialization };
    const doctor = await doctormodel.create(params);
    successResponse(res, "success", doctor);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function updatedoctorHandler(req, res) {
  try {
    const { _id, ...updatedData } = req.body;
    if (!_id) {
      return errorResponse(res, 400, "doctor ID (_id) is required");
    }

    const existingdoctor = await doctormodel.findById(_id);
    if (!existingdoctor) {
      return errorResponse(res, 404, "doctor is not exist");
    }

    const options = { new: true };
    if (
      !updatedData.firstname ||
      !updatedData.lastname ||
      !updatedData.email ||
      !updatedData.mobile ||
      !updatedData.specialization
    ) {
      errorResponse(res, 404, "Some params are missing");
      return;
    }
    const doctor = await doctormodel.findByIdAndUpdate(
      _id,
      updatedData,
      options
    );
    successResponse(res, "successfully updated", doctor);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function deletedoctorHandler(req, res) {
  try {
    const { _id } = req.body;
    if (!_id) {
      return errorResponse(res, 400, "some params are missing");
    }
    const checkexist = await doctormodel.findById(_id);
    if (!checkexist) {
      return errorResponse(res, 404, "doctor not found in database ");
    }
    const doctor = await doctormodel.findByIdAndDelete({ _id: _id });
    successResponse(res, "successfully deleted");
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server");
  }
}
