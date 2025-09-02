import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import doctormodel from "../../model/doctormodel";

const userdoctorRouter = Router();
userdoctorRouter.get("/getall", getdoctorHandler);
export default userdoctorRouter;

async function getdoctorHandler(req, res) {
  try {
    const doctor = await doctormodel.find({});
    successResponse(res, "success", doctor);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
