import mongoose from "mongoose";
import { Schema, model } from "mongoose";

const appointmentSchema = new Schema(
  {
    patientname: String,
    patientmobile: String,
    patientemail: String,
    doctorid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctor",
    },
    specspecialization: { type: String },
    date: { type: Date },
    slot: { type: String }, // e.g., "10:00 AM - 10:30 AM"
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
  },
  { timestamps: true, versionKey: false }
);

function currentLocalTimePlusOffset() {
  const now = new Date();
  const offset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + offset);
}

appointmentSchema.pre("save", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.createdAt = currentTime;
  this.updatedAt = currentTime;
  next();
});

