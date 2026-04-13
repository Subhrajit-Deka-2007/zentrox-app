const mongoose = require("mongoose");
const Comment = require("./commentModel");
const Rating = require("./ratingModel");

const postSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      maxlength: [255, "Image URL cannot be more than 255 characters"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      maxlength: [150, "Title cannot be more than 150 characters"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [500, "Description cannot be more than 500 characters"],
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    strict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ✅ virtual populate — no arrays stored in DB
postSchema.virtual("comments", {
  ref: "Comment",
  foreignField: "post",
  localField: "_id",
});

postSchema.virtual("ratings", {
  ref: "Rating",
  foreignField: "post",
  localField: "_id",
});

// ✅ pre delete hook
postSchema.pre("findOneAndDelete", async function () {
  const postId = this.getFilter()._id;
  await Comment.deleteMany({ post: postId });
  await Rating.deleteMany({ post: postId });
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
