import { Schema, model } from "mongoose";

const eventSchema = new Schema({
  speaker: String,
  topic: String,
  location: {
    type: String,
    default: "",
  },
  time: String,
  Date: Date,
  company: String,
  invitationimage: {
    type: String,
    default: "",
  },
  descriptionevent: String,
  speakerimage: {
    type: String,
    default: "",
  },
});

function currentLocalTimePlusOffset() {
  const now = new Date();
  const offset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + offset);
}

eventSchema.pre("save", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.createdAt = currentTime;
  this.updatedAt = currentTime;
  next();
});

eventSchema.pre("findOneAndUpdate", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.set({ updatedAt: currentTime });
  next();
});

const eventmodel = model("event", eventSchema);
export default eventmodel;
