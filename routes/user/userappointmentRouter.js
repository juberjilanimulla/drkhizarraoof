import { Router } from "express";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";
import appointmentmodel from "../../model/appointmentmodel.js";
import slotbookingmodel from "../../model/slotbookingmodel.js";

const userappointmentRouter = Router();

userappointmentRouter.post("/create", createappointmentHandler);
userappointmentRouter.get("/:patientmobile", getmyappointmentsHandler);
userappointmentRouter.get("/", getallappointmentHandler);

export default userappointmentRouter;

async function createappointmentHandler(req, res) {
  try {
    const {
      patientname,
      patientemail,
      patientmobile,
      doctorid,
      date,
      slotid,
      starttime,
      endtime,
      slottype,
      price,
    } = req.body;

    if (
      !patientname ||
      !patientmobile ||
      !doctorid ||
      !date ||
      !slotid ||
      !starttime ||
      !endtime ||
      !slottype
    ) {
      return errorResponse(res, 400, "Some params are missing");
    }

    // Check if slot exists
    const slot = await slotbookingmodel.findOne({
      _id: slotid,
      doctorid,
      date,
    });

    if (!slot) {
      return errorResponse(res, 404, "Slot not found for doctor");
    }

    // Check if appointment already exists for this slot
    const alreadyBooked = await appointmentmodel.findOne({
      date: new Date(date),
      starttime: starttime.trim(),
      endtime: endtime.trim(),
      status: { $in: ["pending", "confirmed"] },
    });

    if (alreadyBooked) {
      return errorResponse(res, 400, "This slot is already booked");
    }

    // Create appointment with pending + unpaid
    const appointment = await appointmentmodel.create({
      patientname,
      patientemail,
      patientmobile,
      doctorid,
      date,
      slotid,
      starttime: starttime.trim(),
      endtime: endtime.trim(),
      slottype,
      price: price || 0,
      status: "pending",
      paymentStatus: "unpaid",
    });

    successResponse(res, "Appointment created", appointment);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function getmyappointmentsHandler(req, res) {
  try {
    const { patientmobile } = req.params;

    if (!patientmobile) {
      return errorResponse(res, 400, "Patient mobile is required");
    }

    const appointments = await appointmentmodel
      .find({ patientmobile })
      .populate("doctorid", "name specialization")
      .sort({ date: 1, starttime: 1 });

    successResponse(res, "my appointments fetched", appointments);
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, "Internal server error");
  }
}

async function getallappointmentHandler(req, res) {
  try {
    const { doctorid, date } = req.query;

    if (!doctorid || !date) {
      return errorResponse(res, 400, "doctorid and date are required");
    }

    // Find all appointments for doctor on that date
    const appointments = await appointmentmodel.find({
      doctorid,
      date: new Date(date),
      status: { $in: ["pending", "confirmed", "cancelled"] }, // only active bookings
    });

    successResponse(res, "Appointments fetched successfully", {
      appointments,
    });
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
