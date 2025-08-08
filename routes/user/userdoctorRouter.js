import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import doctormodel from "../../model/doctormodel.js";

const userdoctorRouter = Router();

userdoctorRouter.post("/create", createdoctorHandler);

export default userdoctorRouter;

async function createdoctorHandler(req, res) {
  try {
    const { firstname, lastname, email, mobile } = req.body;
    if (!firstname || !lastname || !email || !mobile) {
      return errorResponse(res, 400, "some params are missing");
    }
    const params = { firstname, lastname, email, mobile };
    const doctor = await doctormodel.create(params);
    successResponse(res, "success", doctor);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
