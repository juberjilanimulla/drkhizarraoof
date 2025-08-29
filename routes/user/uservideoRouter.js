import { Router } from "express";
import videomodel from "../../model/videomodel.js";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";

const uservideoRouter = Router();

uservideoRouter.get("/", getvideosHandler);

export default uservideoRouter;

async function getvideosHandler(req, res) {
  try {
    const videos = await videomodel
      .find({ published: true })
      .sort({ createdAt: -1 });
    if (!videos) {
      return errorResponse(res, 404, "videos not uploaded");
    }
    return successResponse(res, "success", videos);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
