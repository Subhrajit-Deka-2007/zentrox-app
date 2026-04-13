const catchAsync = require("../utils/catchAsync");
const Post = require("../models/postModel");
const AppError = require("../errors/AppError");

exports.getAllPost = catchAsync(async (req, res, next) => {
  const page = req.query.page;
  const limit = 10;
  const skip = (page - 1) * limit;
  const totalPost = await Post.countDocuments();
  const totalPages = Math.ceil(totalPost / limit);

  if (page > totalPages && totalPost > 0)
    return next(
      new AppError(
        `Page ${page} does not exist. Total pages available: ${totalPages}`,
      ),
    );

  const post = await Post.find()
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 })
    .select("title description createdAt owner imageUrl comments ratings")
    .populate("owner", "name email")
    .populate({
      path: "comments",
      populate: { path: "owner", select: "name" },
    })
    .populate({
      path: "ratings",
      populate: { path: "owner", select: "name" },
    });

  return res.status(200).json({
    status: "success",
    message: `Retrieved posts from page ${page}`,
    post,
    pagination: {
      currentPage: page,
      totalPages,
      totalPosts: totalPost,
      postsPerPage: limit,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
});
