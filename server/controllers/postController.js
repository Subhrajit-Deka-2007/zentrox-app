const AppError = require("../errors/AppError");
const Post = require("../models/postModel");
const catchAsync = require("../utils/catchAsync");
const { IdChecker } = require("../utils/IdChecker");

exports.createPost = catchAsync(async (req, res, next) => {

 
  const { _id } = req.user;
  const { title, description } = req.body;
  // ✅ imageUrl comes from multer — NOT from req.body anymore

  // ✅ check image was uploaded
  if (!req.file)
    return next(new AppError("Please upload an image for the post", 400));

  // ✅ check empty file
  if (req.file.size === 0)
    return next(new AppError("Image file is empty!", 400));

  // ✅ check required fields
  if (!title || !description)
    return next(new AppError("Title and description are required", 400));

  // ✅ build imageUrl from uploaded file
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/images/${req.file.filename}`;

  // ✅ check title uniqueness
  const exists = await Post.findOne({ title });
  if (exists) return next(new AppError("Title already exists", 400));

  await Post.create({
    title,
    imageUrl, // ✅ from multer not from user input
    description,
    owner: _id,
  });

  return res.status(201).json({
    status: "success",
    message: "Post created successfully",
    data: { imageUrl }, // ✅ return so frontend can display it
  });
});



exports.updatePost = catchAsync(async (req, res, next) => {
  const pid = req.params.pid;

  const post = await Post.findById(pid);
  if (!post) return next(new AppError("Post doesn't exist", 404));

  const result = IdChecker(req.user._id, post.owner);
  if (!result)
    return next(
      new AppError("You don't have permission to update this post", 403),
    );

  //  filter only allowed text fields
  const allowedFields = ["title", "description"];
  const filteredBody = Object.keys(req.body)
    .filter((key) => allowedFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = req.body[key];
      return obj;
    }, {});

  //  if image was uploaded add it to filteredBody
  if (req.file) {
    //  check file not empty
    if (req.file.size === 0)
      return next(new AppError("Image file is empty!", 400));

    //  build new imageUrl
    filteredBody.imageUrl = `${req.protocol}://${req.get("host")}/uploads/images/${req.file.filename}`;
  }

  //  check if anything was sent
  if (Object.keys(filteredBody).length === 0)
    return next(new AppError("No valid fields to update", 400));

  // check title uniqueness
  if (filteredBody.title) {
    const exists = await Post.findOne({
      title: filteredBody.title,
      _id: { $ne: pid },
    });
    if (exists) return next(new AppError("Title already in use", 400));
  }

  const updatedPost = await Post.findByIdAndUpdate(pid, filteredBody, {
    returnDocument: "after",
    runValidators: true,
  });

  return res.status(200).json({
    status: "success",
    message: "Post updated successfully!",
    data: { post: updatedPost },
  });
});