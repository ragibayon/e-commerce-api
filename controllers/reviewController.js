const {StatusCodes} = require('http-status-codes');
const {NotFoundError, BadRequestError} = require('../errors');
const {checkPermission} = require('../utils');
const Review = require('../models/Review');
const Product = require('../models/Product');

const createReview = async (req, res, next) => {
  // check if the product exists
  const {product: productId} = req.body;
  const isValidProduct = await Product.findOne({_id: productId});
  if (!isValidProduct) {
    throw new NotFoundError('Product not found');
  }

  // check if the user has already given a review
  const alreadySubmitted = await Review.findOne({
    user: req.user.userId,
    product: productId,
  });
  if (alreadySubmitted) {
    throw new BadRequestError(
      'You have already submitted a review for this product'
    );
  }

  // new review
  req.body.user = req.user.userId;
  const review = await Review.create(req.body); // calls pre save hook

  res.status(StatusCodes.CREATED).json({
    msg: 'review created',
  });
};

const getAllReviews = async (req, res, next) => {
  const reviews = await Review.find({}).populate({
    path: 'product',
    select: 'name company price',
  });
  res.status(StatusCodes.OK).json({
    reviews,
    count: reviews.length,
  });
};

const getSingleReview = async (req, res, next) => {
  const rid = req.params.id;
  const review = await Review.findById(rid);
  if (!review) {
    throw new NotFoundError('Review not found');
  }
  res.status(StatusCodes.OK).json({
    review,
  });
};

const updateReview = async (req, res, next) => {
  const rid = req.params.id;
  const {rating, title, comment} = req.body;

  // check if the review exists
  const review = await Review.findById(rid);
  if (!review) {
    throw new NotFoundError('Review not found');
  }

  // check if the user is the owner of the review
  checkPermission(req.user, review.user);

  review.rating = rating;
  review.title = title;
  review.comment = comment;
  await review.save();

  res.status(StatusCodes.OK).json({review});
};
const deleteReview = async (req, res, next) => {
  // check if the review exists (review will not exist if the product does not exist)
  const rid = req.params.id;
  const review = await Review.findById(rid);
  if (!review) {
    throw new NotFoundError('Review not found');
  }

  // check if the user is the owner of the review
  checkPermission(req.user, review.user);

  await review.remove();
  res.status(StatusCodes.OK).json({
    msg: 'review deleted',
  });
};

const getSingleProductReview = async (req, res, next) => {
  const pid = req.params.id;
  console.log(pid);
  const reviews = await Review.find({product: pid});
  res.status(StatusCodes.OK).json({
    reviews,
    count: reviews.length,
  });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReview,
};
