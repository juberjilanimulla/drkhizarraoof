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
    const existingSlot = await slotbookingmodel.findOne({
      doctorid,
      date,
      starttime,
      endtime,
    });

    if (existingSlot) {
      return errorResponse(
        res,
        400,
        "This slot is already booked for the doctor"
      );
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
      return errorResponse(res, 404, "slotbooking does not exist");
    }

    const { doctorid, date, starttime, endtime, slottype, isbooked } =
      updatedData;

    if (!doctorid || !date || !starttime || !endtime || !slottype) {
      return errorResponse(res, 400, "Some params are missing");
    }

    //  Check if another slot exists with same doctor/date/time
    const duplicateSlot = await slotbookingmodel.findOne({
      doctorid,
      date,
      starttime,
      endtime,
      _id: { $ne: _id }, // exclude current slot
    });

    if (duplicateSlot) {
      return errorResponse(
        res,
        400,
        "This slot is already booked for the doctor"
      );
    }

    // Update slot booking
    const options = { new: true };
    const slotbooking = await slotbookingmodel.findByIdAndUpdate(
      _id,
      updatedData,
      options
    );

    successResponse(res, "Successfully updated", slotbooking);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function deleteslotbookingHandler(req, res) {
  try {
    const { _id } = req.body;
    if (!_id) {
      return errorResponse(res, 400, "slot booking ID (_id) is required");
    }

    const slot = await slotbookingmodel.findById(_id);
    if (!slot) {
      return errorResponse(res, 404, "Slot booking not found in database");
    }

    // Instead of deleting → mark as available
    if (slot.isbooked === false) {
      return successResponse(res, "Slot is already available", slot);
    }

    const updatedSlot = await slotbookingmodel.findByIdAndUpdate(
      _id,
      { isbooked: false },
      { new: true }
    );

    successResponse(res, "Slot is now available for booking", updatedSlot);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
