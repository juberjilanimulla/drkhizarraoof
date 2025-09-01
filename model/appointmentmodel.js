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
    specialization: { type: String },
    date: { type: Date },
    starttime: { type: String, required: true },
    endtime: { type: String, required: true },
    slottype: { type: String, enum: ["online", "offline"], required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
    price: {
      type: Number,
      default: 0,
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

appointmentSchema.pre("findOneAndUpdate", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.set({ updatedAt: currentTime });
  next();
});

const appointmentmodel = model("appointment", appointmentSchema);
export default appointmentmodel;
