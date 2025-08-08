import { Schema, model } from "mongoose";

const subcribeSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    subcribe: {
      type: Boolean,
      default: true,
    },
    subcribedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true, versionKey: false }
);

function currentLocalTimePlusOffset() {
  const now = new Date();
  const offset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + offset);
}

subcribeSchema.pre("save", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.createdAt = currentTime;
  this.updatedAt = currentTime;
  next();
});

subcribeSchema.pre("findOneAndUpdate", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.set({ updatedAt: currentTime() });
  next();
});

const subcribemodel = model("subcribe", subcribeSchema);
export default subcribemodel;
