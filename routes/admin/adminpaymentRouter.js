import { Router } from "express";
import paymentmodel from "../../model/paymentmodel.js";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";

const adminpaymentRouter = Router();

adminpaymentRouter.post("/getall", getallpaymentHandler);
adminpaymentRouter.delete("/delete", deletepaymentHandler);

export default adminpaymentRouter;

async function getallpaymentHandler(req, res) {
  try {
    const { pageno = 0, filterBy = {}, sortby = {}, search = "" } = req.body;
    const limit = 10;
    const skip = pageno * limit;

    let query = { $and: [] };

    // Apply filters
    if (filterBy) {
      Object.keys(filterBy).forEach((key) => {
        if (filterBy[key] !== undefined) {
          query.$and.push({ [key]: filterBy[key] });
        }
      });
    }

    // Apply search (via appointment populate)
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      // We can't directly search appointment fields here,
      // so this will be applied after populate if needed
      query.$and.push({ orderId: { $regex: searchRegex } });
    }

    if (query.$and.length === 0) {
      query = {};
    }

    // Sorting logic
    const sortBy =
      Object.keys(sortby).length !== 0
        ? Object.keys(sortby).reduce((acc, key) => {
            acc[key] = sortby[key] === "asc" ? 1 : -1;
            return acc;
          }, {})
        : { createdAt: -1 };

    // Fetch with populate
    const payments = await paymentmodel
      .find(query)
      .populate(
        "appointmentid",
        "patientname patientemail patientmobile date starttime endtime status"
      )
      .populate("doctorid", "name specialization")
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    const totalCount = await paymentmodel.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    successResponse(res, "Payments fetched successfully", {
      payments,
      totalCount,
      totalPages,
    });
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function deletepaymentHandler(req, res) {
  try {
    const { paymentid } = req.body;
    if (!paymentid) {
      return errorResponse(res, 400, "some params are missing");
    }
    const payment = await paymentmodel.findByIdAndDelete({ _id: paymentid });
    if (!payment) {
      return errorResponse(res, 404, "payment id not found ");
    }
    successResponse(res, "successfully deletd");
  } catch (error) {
    console.log("error", error);
    errorResponse(res, 500, "internal server error");
  }
}
