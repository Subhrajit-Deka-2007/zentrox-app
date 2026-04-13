const Rating = require("../models/ratingModel");
const Post = require("../models/postModel");
const { IdChecker } = require("../utils/IdChecker");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../errors/AppError");

exports.createRating = catchAsync(async (req, res, next) => { // ✅ next added
    const { pid } = req.params;
    const { _id } = req.user; // ✅ fixed destructuring

    // ✅ check post exists
    const checkPost = await Post.findById(pid); // ✅ fixed findById
    if (!checkPost) return next(new AppError("Post doesn't exist", 404));

    // ✅ check if already rated
    const alreadyRated = await Rating.findOne({ owner: _id, post: pid });
    if (alreadyRated) return next(new AppError("You have already rated this post", 400));

    // ✅ validate rate
    const rate = Number(req.body.rate);
    if (!rate || rate < 1 || rate > 5)
        return next(new AppError("Rate must be a number between 1 and 5", 400));

    await Rating.create({
        rate,
        owner: _id, // ✅ cleaner
        post: pid
    });

    return res.status(201).json({
        status: 'success',
        message: "Rated successfully!"
    });
});





exports.updateRating = catchAsync(async (req, res, next) => { // ✅ exported + next added
    const { pid, rid } = req.params;

    // ✅ check post exists
    const checkPost = await Post.findById(pid);
    if (!checkPost) return next(new AppError("Post doesn't exist", 404));

    // ✅ check rating exists
    const findRate = await Rating.findOne({ _id: rid, post: pid }); // ✅ also verify belongs to post
    if (!findRate) return next(new AppError("Rating doesn't exist", 404));

    // ✅ check ownership
    const result = IdChecker(req.user._id, findRate.owner);
    if (!result) return next(new AppError("You don't have authority to update this rating", 403));

    // ✅ validate rate
    const rate = Number(req.body.rate);
    if (!rate || rate < 1 || rate > 5)
        return next(new AppError("Rate must be a number between 1 and 5", 400));

    await Rating.findByIdAndUpdate(
        rid,
        { rate },
        { returnDocument: 'after', runValidators: true } // ✅ fixed
    );

    return res.status(200).json({ // ✅ 200 for update
        status: "success",
        message: "Rating updated successfully!"
    });
});


