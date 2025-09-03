import Router from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import {
  successResponse,
  errorResponse,
} from "../../helpers/serverResponse.js";
import appointmentmodel from "../../model/appointmentmodel.js";
import paymentmodel from "../../model/paymentmodel.js";

const userpaymentRouter = Router();

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

userpaymentRouter.post("/order", createorderHandler);

userpaymentRouter.post("/verify", verifypaymentHandler);

export default userpaymentRouter;

async function createorderHandler(req, res) {
  try {
    const { appointmentid, amount } = req.body;

    if (!appointmentid || !amount) {
      return errorResponse(res, 400, "appointmentid and amount are required");
    }

    const appointment = await appointmentmodel.findById(appointmentid);
    if (!appointment) {
      return errorResponse(res, 404, "appointment not found");
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // in paise
      receipt: `receipt_${appointmentid}`,
    };

    const order = await razorpay.orders.create(options);

    // Save payment record
    const payment = await paymentmodel.create({
      appointmentid: appointmentid,
      doctorid: appointment.doctorid,
      amount,
      orderid: order.id,
      paymentstatus: "created",
    });

    successResponse(res, "Order created", {
      orderId: order.id,
      amount: order.amount,
      paymentid: payment._id,
    });
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, "Internal server error");
  }
}

async function verifypaymentHandler(req, res) {
  try {
    const { appointmentid, orderid, paymentid, signature } = req.body;

    if (!appointmentid || !orderid || !paymentid) {
      return errorResponse(res, 400, "Missing payment verification params");
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(orderid + "|" + paymentid)
      .digest("hex");
    console.log("generated", generatedSignature);
    if (generatedSignature !== signature) {
      return errorResponse(res, 400, "Invalid payment signature");
    }

    // Update appointment
    await appointmentmodel.findByIdAndUpdate(appointmentid, {
      status: "confirmed",
      paymentstatus: "paid",
    });

    // Update payment
    const payment = await paymentmodel.findOneAndUpdate(
      { orderid },
      {
        paymentid,
        signature,
        paymentstatus: "paid",
        paidAt: new Date(),
      },
      { new: true }
    );

    successResponse(res, "Payment verified successfully", payment);
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, "Internal server error");
  }
}
