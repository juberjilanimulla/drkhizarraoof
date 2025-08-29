import { Router } from "express";
import slotbookingmodel from "../../model/slotbookingmodel.js";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";

const adminslotbookingRouter = Router();

adminslotbookingRouter.post("/", getslotbookingHandler);
adminslotbookingRouter.post("/create", createslotbookingHandler);
adminslotbookingRouter.put("/update", updateslotbookingHandler);
adminslotbookingRouter.delete("/delete", deleteslotbookingHandler);

export default adminslotbookingRouter;

async function getslotbookingHandler(req, res) {
  try {
    const { pageno = 0, filterBy = {}, sortby = {}, search = "" } = req.body;
    const limit = 10;
    const skip = pageno * limit;

    let query = {};

    // Apply search
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [];
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
    const slotbooking = await slotbookingmodel
      .find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    const totalCount = await slotbookingmodel.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    successResponse(res, "successfully", {
      slotbooking,
      totalPages,
    });
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function createslotbookingHandler(req, res) {
  try {
    const { doctorid, date, starttime, endtime, slottype } = req.body;
    if (!doctorid || !date || !starttime || !endtime || !slottype) {
      return errorResponse(res, 400, "some params are missing");
    }
    const params = { doctorid, date, starttime, endtime, slottype };
    const slotbooking = await slotbookingmodel.create(params);
    successResponse(res, "success", slotbooking);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function updateslotbookingHandler(req, res) {
  try {
    const { _id, ...updatedData } = req.body;
    if (!_id) {
      return errorResponse(res, 400, "slot booking ID (_id) is required");
    }

    const existingslotbooking = await slotbookingmodel.findById(_id);
    if (!existingslotbooking) {
      return errorResponse(res, 404, "slotbooking is not exist");
    }

    const options = { new: true };
    if (
      !updatedData.dodtorid ||
      !updatedData.date ||
      !updatedData.starttime ||
      !updatedData.endtime ||
      !updatedData.slottype ||
      !updatedData.isbooked
    ) {
      errorResponse(res, 404, "Some params are missing");
      return;
    }
    const slotbooking = await slotbookingmodel.findByIdAndUpdate(
      _id,
      updatedData,
      options
    );
    successResponse(res, "successfully updated", slotbooking);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function deleteslotbookingHandler(req, res) {
  try {
    const { _id } = req.body;
    if (!_id) {
      return errorResponse(res, 400, "some params are missing");
    }
    const checkexist = await slotbookingmodel.findById(_id);
    if (!checkexist) {
      return errorResponse(res, 404, "slotbooking not found in database ");
    }
    const slotbooking = await slotbookingmodel.findByIdAndDelete({ _id: _id });
    successResponse(res, "successfully deleted");
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
