import { Router } from "express";
import reviewmodel from "../../model/reviewmodel.js";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";

const userreviewRouter = Router();

userreviewRouter.post("/create", createreviewHandler);

export default userreviewRouter;

async function createreviewHandler(req, res) {
  try {
    const { name, mobile, rating, message } = req.body;
    if (!name || !mobile || !rating) {
      return errorResponse(res, 400, "some params are missing");
    }
    const params = { name, mobile, rating, message };
    const review = await reviewmodel.create(params);
    successResponse(res, "successfully added review", review);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
