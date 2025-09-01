import { Router } from "express";
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

userpaymentRouter.post("/order", createOrderHandler);

userpaymentRouter.post("/verify", verifyPaymentHandler);

export default userpaymentRouter;

async function createOrderHandler(req, res) {
  try {
    const { appointmentId, amount } = req.body;

    if (!appointmentId || !amount) {
      return errorResponse(res, 400, "appointmentId and amount are required");
    }

    const appointment = await appointmentmodel.findById(appointmentId);
    if (!appointment) {
      return errorResponse(res, 404, "Appointment not found");
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // in paise
      currency,
      receipt: `receipt_${appointmentId}`,
    };

    const order = await razorpay.orders.create(options);

    // Save payment record
    const payment = await paymentmodel.create({
      appointmentid: appointmentId,
      doctorid: appointment.doctorid,
      amount,
      currency,
      orderId: order.id,
      paymentStatus: "created",
    });

    successResponse(res, "Order created", {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, "Internal server error");
  }
}

async function verifyPaymentHandler(req, res) {
  try {
    const { appointmentId, orderId, paymentId, signature } = req.body;

    if (!appointmentId || !orderId || !paymentId || !signature) {
      return errorResponse(res, 400, "Missing payment verification params");
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    if (generatedSignature !== signature) {
      return errorResponse(res, 400, "Invalid payment signature");
    }

    // Update appointment
    await appointmentmodel.findByIdAndUpdate(appointmentId, {
      status: "confirmed",
      paymentStatus: "paid",
    });

    // Update payment
    const payment = await paymentmodel.findOneAndUpdate(
      { orderId },
      {
        paymentId,
        signature,
        paymentStatus: "paid",
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
