import { Router } from "express";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";
import appointmentmodel from "../../model/appointmentmodel.js";
import slotbookingmodel from "../../model/slotbookingmodel.js";

const userappointmentRouter = Router();

userappointmentRouter.post("/create", createappointmentHandler);

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
      timeslot,
      slottype,
    } = req.body;

    if (
      !patientname ||
      !patientemail ||
      !patientmobile ||
      !doctorid ||
      !date ||
      !slotid ||
      !timeslot ||
      !slottype
    ) {
      return errorResponse(res, 400, "some params are missing");
    }
    // Check slot availability in slotbookingmodel
    const slot = await slotbookingmodel.findOne({
      _id: slotid,
      doctorid,
      date,
      isbooked: false,
    });

    if (!slot) {
      return errorResponse(res, 404, "Slot not available or already booked");
    }

    // Check slot type match
    if (slot.slottype !== slottype) {
      return errorResponse(
        res,
        400,
        "Slot type mismatch with doctor availability"
      );
    }

    // Check duplicate booking in appointment table
    const alreadyBooked = await appointmentmodel.findOne({
      doctorid,
      date,
      slotid,
      timeslot,
    });

    if (alreadyBooked) {
      return errorResponse(res, 400, "This slot is already booked");
    }
    const appointment = await appointmentmodel.create({
      patientname,
      patientemail,
      patientmobile,
      doctorid,
      date,
      slotid,
      timeslot,
      slottype,
      status: "pending",
      paymentStatus: "unpaid",
    });

    // ✅ Mark slot as booked
    await slotbookingmodel.findByIdAndUpdate(slotid, { isbooked: true });

    successResponse(res, "Appointment booked successfully", appointment);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
