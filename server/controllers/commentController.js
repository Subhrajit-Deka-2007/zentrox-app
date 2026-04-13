const AppError = require("../errors/AppError");
const Comment = require("../models/commentModel");
const Post = require("../models/postModel"); // ✅ FIXED
const catchAsync = require("../utils/catchAsync");
const { IdChecker } = require("../utils/IdChecker");

// ✅ CREATE COMMENT
exports.createComment = catchAsync(async (req, res, next) => {
  const { _id } = req.user;
  const { pid } = req.params;
  const { text } = req.body;

  if (!text || text.trim() === "")
    return next(new AppError("Comment text is required", 400));

  const checkPost = await Post.findById(pid);
  if (!checkPost) return next(new AppError("Post doesn't exist", 404));

  await Comment.create({
    owner: _id,
    post: pid,
    text,
  });

  return res.status(201).json({
    status: "success",
    message: "Comment created successfully",
  });
});

// ✅ UPDATE COMMENT (ONLY ONE VERSION)
exports.updateComment = catchAsync(async (req, res, next) => {
  const { pid, cid } = req.params;
  const { text } = req.body;

  if (!text || text.trim() === "")
    return next(new AppError("Comment text is required", 400));

  const comment = await Comment.findOne({ _id: cid, post: pid });
  if (!comment) return next(new AppError("Comment doesn't exist", 404));

  const result = IdChecker(req.user._id, comment.owner);
  if (!result) return next(new AppError("You don't have authority", 403));

  await Comment.findByIdAndUpdate(
    cid,
    { text },
    { new: true, runValidators: true },
  );

  return res.status(200).json({
    status: "success",
    message: "Comment updated successfully",
  });
});
