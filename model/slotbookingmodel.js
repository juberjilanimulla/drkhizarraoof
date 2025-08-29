import { mongoose, Schema, model } from "mongoose";

const slotbookingSchema = new Schema(
  {
    doctorid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctor",
    },
    date: { type: Date },
    starttime: { type: String },
    endtime: { type: String },
    slottype: {
      type: String,
      enum: ["online", "offline"],
      default: "",
    },
    isbooked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

function currentLocalTimePlusOffset() {
  const now = new Date();
  const offset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + offset);
}

slotbookingSchema.pre("save", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.createdAt = currentTime;
  this.updatedAt = currentTime;
  next();
});

slotbookingSchema.pre("findOneAndUpdate", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.set({ updatedAt: currentTime });
  next();
});

const slotbookingmodel = model("slotbooking", slotbookingSchema);
export default slotbookingmodel;
