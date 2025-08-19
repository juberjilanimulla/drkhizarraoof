import { model, Schema } from "mongoose";

const blogSchema = new Schema(
  {
    title: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "",
    },
    metatitle: {
      type: String,
      default: "",
    },
    metadescription: {
      type: String,
    },
    keywords: {
      type: String,
    },
    coverimage: {
      type: String,
      default: "",
    },
    content: [
      {
        title: {
          type: String,
        },
        description: {
          type: String,
        },
      },
    ],
    author: {
      type: String,
      default: "Dr. Khizar Raoof",
    },
    published: {
      type: Boolean,
      default: false,
    },
    featured: {
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

blogSchema.pre("save", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.createdAt = currentTime;
  this.updatedAt = currentTime;
  next();
});

blogSchema.pre("findOneAndUpdate", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.set({ updatedAt: currentTime });
  next();
});

const blogmodel = model("blog", blogSchema);
export default blogmodel;
