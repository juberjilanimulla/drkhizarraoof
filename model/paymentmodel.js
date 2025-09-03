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
    paymentstatus: {
      type: String,
      enum: ["created", "pending", "paid", "failed", "refunded"],
      default: "created",
    },
    // Razorpay / Stripe fields
    orderid: String,
    paymentid: String,
    signature: String,
    method: String, // card, UPI, netbanking, wallet, etc.
    errormessage: String,
    paidAt: Date,
  },
  { timestamps: true, versionKey: false }
);

function currentLocalTimePlusOffset() {
  const now = new Date();
  const offset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + offset);
}

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
