const {NotFoundError, BadRequestError} = require('../errors');
const Product = require('../models/Product');
// const fileUpload = require('express-fileupload');
const path = require('path');
const {StatusCodes} = require('http-status-codes');

const createProduct = async (req, res, next) => {
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({
    product,
  });
};

const getAllProducts = async (req, res, next) => {
  const products = await Product.find();
  res.status(StatusCodes.OK).json({
    products,
    count: products.length,
  });
};

const getSingleProduct = async (req, res, next) => {
  const pid = req.params.id;
  const product = await Product.findOne({_id: pid});

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  res.status(StatusCodes.OK).json({
    product,
  });
};

const updateProduct = async (req, res, next) => {
  const pid = req.params.id;
  const product = await Product.findOne({_id: pid});
  if (!product) {
    throw new NotFoundError('Product not found');
  }
  const updatedProduct = await Product.findByIdAndUpdate(pid, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(StatusCodes.OK).json({
    product: updatedProduct,
  });
};

const deleteProduct = async (req, res, next) => {
  const pid = req.params.id;
  const product = await Product.findOne({_id: pid});

  if (!product) {
    throw new NotFoundError('Product not found');
  }
  await product.remove();
  res.status(StatusCodes.OK).json({
    msg: 'product deleted',
  });
};

const uploadImage = async (req, res, next) => {
  const productImage = req.files.image;
  console.log(productImage);
  if (!productImage) {
    throw new BadRequestError('Please upload a file');
  }
  if (!productImage.mimetype.startsWith('image')) {
    throw new BadRequestError('Please upload an image');
  }

  const maxSize = 1024 * 1024;

  if (productImage.size > maxSize) {
    throw new BadRequestError('Please upload an image smaller than 1MB');
  }

  const imageLocation = path.join(
    __dirname,
    '../public/uploads',
    productImage.name
  );

  await productImage.mv(imageLocation);

  res.status(StatusCodes.OK).json({
    img: `/uploads/${productImage.name}`,
  });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
