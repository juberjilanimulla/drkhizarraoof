import { Router } from "express";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";
import appointmentmodel from "../../model/appointmentmodel.js";

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

    const params = {
      patientname,
      patientemail,
      patientmobile,
      doctorid,
      date,
      slotid,
      timeslot,
      slottype,
    };

    const appointment = await appointmentmodel.create(params);
    // await appointmentmodel.populate(p);
    successResponse(res, "success", appointment);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
