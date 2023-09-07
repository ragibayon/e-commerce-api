const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide product name'],
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    price: {
      type: Number,
      default: 0,
      required: [true, 'Please provide product price'],
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'Please provide product description'],
      maxlength: [1000, 'Product description cannot exceed 1000 characters'],
    },
    image: {
      type: String,
      default: '/uploads/example.jpg',
    },
    category: {
      type: String,
      enum: ['office', 'kitchen', 'bedroom'],
      required: [true, 'Please select category'],
    },
    company: {
      type: String,
      required: [true, 'Please provide company'],
      enum: {
        values: ['ikea', 'marcos', 'liddy'],
        message: '{VALUE} is not supported', // STRING FORMAT FOR MONGOOSE
      },
    },
    colors: {
      type: [String],
      required: true,
      default: ['#222'],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      default: 15,
      required: [true, 'Please provide product inventory'],
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'A product must belong to a user'],
    },
  },
  {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
  }
);

// from the review model, I want to match the id of the product field to the id of the product model.
ProductSchema.virtual('reviews', {
  ref: 'Review', // model name
  foreignField: 'product', // from review model's product field
  localField: '_id', // the _id of the product model will be matched with the value of the "product" field in review model
  justOne: false,
  // match: {rating: 5}, // only the products with review of 5
});

ProductSchema.pre('remove', async function (next) {
  // from product model delete reviews from review model
  await this.model('Review').deleteMany({product: this._id});
  next();
});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
