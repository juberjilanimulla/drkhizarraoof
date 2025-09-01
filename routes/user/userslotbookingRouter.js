import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import slotbookingmodel from "../../model/slotbookingmodel.js";
import appointmentmodel from "../../model/appointmentmodel.js";

const userslotbookingRouter = Router();

userslotbookingRouter.get("/:doctorid", getuserslotbookingHandler);

export default userslotbookingRouter;

async function getuserslotbookingHandler(req, res) {
  try {
    const { doctorid } = req.params;

    const { date } = req.query; // YYYY-MM-DD

    if (!doctorid || !date) {
      return errorResponse(res, 400, "doctorid and date are required");
    }

    // Fetch slot availability (doctor added ranges like 10:00–18:00)
    const slots = await slotbookingmodel.find({
      doctorid,
      date: new Date(date),
    });

    if (!slots || slots.length === 0) {
      return successResponse(res, "No slots found for this date", []);
    }

    // Fetch already booked appointments for the same doctor/date
    const bookedAppointments = await appointmentmodel.find({
      doctorid,
      date: new Date(date),
      status: { $in: ["pending", "confirmed"] }, // pending (in 7 min hold) or confirmed
    });

    const bookedTimes = bookedAppointments.map((a) => a.starttime);

    // Prepare response
    const slotResponse = slots.map((slot) => {
      return {
        _id: slot._id,
        doctorid: slot.doctorid,
        date: slot.date,
        starttime: slot.starttime,
        endtime: slot.endtime,
        slottype: slot.slottype,
      };
    });

    successResponse(res, "Slots fetched successfully", slotResponse);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
