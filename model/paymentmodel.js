import { Schema, model } from "mongoose";

const paymentSchema = new Schema(
  {
    appointmentid: {
      type: Schema.Types.ObjectId,
      ref: "appointment",
    },
    doctorid: {
      type: Schema.Types.ObjectId,
      ref: "doctor",
    },
    amount: { type: Number },
    paymentStatus: {
      type: String,
      enum: ["created", "pending", "paid", "failed", "refunded"],
      default: "created",
    },
    // Razorpay / Stripe fields
    orderId: String,
    paymentId: String,
    signature: String,
    method: String, // card, UPI, netbanking, wallet, etc.
    errorMessage: String,
    paidAt: Date,
  },
  { timestamps: true, versionKey: false }
);

paymentSchema.pre("save", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.createdAt = currentTime;
  this.updatedAt = currentTime;
  next();
});

paymentSchema.pre("findOneAndUpdate", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.set({ updatedAt: currentTime });
  next();
});

const paymentmodel = model("payment", paymentSchema);
export default paymentmodel;
