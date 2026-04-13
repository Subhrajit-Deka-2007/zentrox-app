const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const Post = require("../models/postModel");
const { IdChecker } = require("../utils/IdChecker");
const AppError = require("../errors/AppError");
const Comment = require("../models/commentModel");
const Rating = require("../models/ratingModel");

exports.deleteUser = catchAsync(async (req, res, next) => {
  const id = req.user._id;

  const userExists = await User.findById(id);
  if (!userExists) return next(new AppError("User doesn't exist", 404));

  await User.findByIdAndDelete(id);

  return res.status(204).send();
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const { pid } = req.params;

  const post = await Post.findById(pid);
  if (!post) return next(new AppError("Post doesn't exist!", 404));

  // ✅ admin can delete any post, owner can only delete their own
  const isAdmin = req.user.role === "admin";
  const isOwner = IdChecker(req.user._id, post.owner);

  if (!isAdmin && !isOwner)
    return next(
      new AppError("You don't have permission to delete this post", 403),
    );

  await Post.findByIdAndDelete(pid);

  return res.status(204).send();
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const { pid, cid } = req.params;

  const comment = await Comment.findOne({ _id: cid, post: pid });
  if (!comment)
    return next(new AppError("Comment not found on this post", 404));

  // ✅ admin can delete any comment, owner can only delete their own
  const isAdmin = req.user.role === "admin";
  const isOwner = IdChecker(req.user._id, comment.owner);

  if (!isAdmin && !isOwner)
    return next(
      new AppError("You don't have permission to delete this comment", 403),
    );

  await Comment.findByIdAndDelete(cid);

  return res.status(204).send();
});

exports.deleteRating = catchAsync(async (req, res, next) => {
  const { pid, rid } = req.params;

  const rating = await Rating.findOne({ _id: rid, post: pid });
  if (!rating) return next(new AppError("Rating not found on this post", 404));

  // ✅ admin can delete any rating, owner can only delete their own
  const isAdmin = req.user.role === "admin";
  const isOwner = IdChecker(req.user._id, rating.owner);

  if (!isAdmin && !isOwner)
    return next(
      new AppError("You don't have permission to delete this rating", 403),
    );

  await Rating.findByIdAndDelete(rid);

  return res.status(204).send();
});
