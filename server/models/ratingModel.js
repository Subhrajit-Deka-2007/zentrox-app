const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    rate: {
      // ✅ consistent with controller
      type: Number,
      max: [5, "Rating cannot be more than 5"],
      min: [1, "Rating cannot be less than 1"],
      required: [true, "Rating is required"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Post is required"],
    },
  },
  { timestamps: true, strict: true },
);

// ✅ prevent duplicate ratings from same user on same post
ratingSchema.index({ owner: 1, post: 1 }, { unique: true });

const Rating = mongoose.model("Rating", ratingSchema);
module.exports = Rating;
