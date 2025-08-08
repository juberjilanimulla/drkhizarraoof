import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import contactmodel from "../../model/contactmodel.js";

const usercontactRouter = Router();
usercontactRouter.post("/create", createcontactHandler);
export default usercontactRouter;

async function createcontactHandler(req, res) {
  try {
    const { name, mobile, email, message } = req.body;
    if (!name || !mobile || !email || !message) {
      return errorResponse(res, 400, "some params are missing");
    }
    const params = { name, mobile, email, message };
    const contact = await contactmodel.create(params);
    successResponse(res, "success", contact);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
