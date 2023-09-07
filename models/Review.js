const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please provide rating'],
    },
    title: {
      type: String,
      trim: true,
      required: [true, 'Please provide review title'],
      maxlength: 100,
    },
    comment: {
      type: String,
      trim: true,
      required: [true, 'Please provide review text'],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a product'],
    },
  },
  {
    timestamps: true,
  }
);

// only one review per product for a particular user
ReviewSchema.index({product: 1, user: 1}, {unique: true});

// call this function to calculate the average rating when a review is created and deleted
ReviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    {
      // get all the reviews of matching product id
      $match: {
        product: productId,
      },
    },
    {
      // group the results
      $group: {
        _id: null,
        averageRating: {
          $avg: '$rating',
        },
        numOfReviews: {
          $sum: 1,
        },
      },
    },
  ]);
  console.log(result);
  try {
    await this.model('Product').findOneAndUpdate(
      {_id: productId},
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (err) {
    console.log(err);
  }
};

ReviewSchema.post('save', async function () {
  console.log('save hook called and calculated');
  await this.constructor.calculateAverageRating(this.product);
});

ReviewSchema.post('remove', async function () {
  console.log('remove hook called and calculated');
  await this.constructor.calculateAverageRating(this.product);
});

const Review = mongoose.model('Review', ReviewSchema);
module.exports = Review;
