import { Router } from "express";
import {
  errorResponse,
  successResponse,
} from "../../helpers/serverResponse.js";
import blogmodel from "../../model/blogmodel.js";

const userblogRouter = Router();

userblogRouter.get("/", getallblogHandler);

export default userblogRouter;

async function getallblogHandler(req, res) {
  try {
    const blog = await blogmodel.aggregate([
      {
        $addFields: {
          featuredOrder: { $cond: [{ $eq: ["$featured", true] }, 1, 0] },
        },
      },
      {
        $sort: {
          featuredOrder: -1, // featured: true first
          createdAt: -1, // then sort by newest
        },
      },
    ]);
    successResponse(res, "successfully blog", blog);
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
