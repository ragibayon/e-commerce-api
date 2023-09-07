const {StatusCodes} = require('http-status-codes');
const Order = require('./../models/Order');
const Product = require('./../models/Product');
const {checkPermission} = require('./../utils');
const {NotFoundError, BadRequestError} = require('./../errors');

const fakeStripeAPI = async (amount, currency) => {
  const clientSecret = 'some random client secret value';
  return {
    clientSecret,
    amount,
  };
};

const createOrder = async (req, res, next) => {
  const {items: cartItems, tax, shippingFee} = req.body;

  if (!cartItems || cartItems.length < 1) {
    throw new BadRequestError('Cart is empty');
  }

  if (!tax || !shippingFee) {
    throw new BadRequestError('Tax and shipping fee are required');
  }

  let orderItems = [];
  let subtotal = 0;

  // async operation in for loop, can not use for each, array.map
  for (const item of cartItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new NotFoundError('Product not found with id:' + item.product);
    }
    const {name, price, image, _id} = product;
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };
    orderItems = [...orderItems, singleOrderItem]; // we could also use push
    subtotal += item.amount * price;
  }

  const total = tax + shippingFee + subtotal;
  // get client secret
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: 'usd',
  });

  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.clientSecret,
    user: req.user.userId,
  });

  res.status(StatusCodes.CREATED).json({
    order,
    clientSecret: order.clientSecret,
  });
};

const getAllOrders = async (req, res, next) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({
    orders,
    count: orders.length,
  });
};

const getSingleOrder = async (req, res, next) => {
  const oid = req.params.id;
  const order = await Order.findOne({_id: oid, user: req.user.userId});
  if (!order) {
    throw new NotFoundError('order not found with id: ' + oid);
  }

  checkPermission(req.user, order.user);
  res.status(StatusCodes.OK).json({
    order,
  });
};
const getCurrentUserOrders = async (req, res, next) => {
  const orders = await Order.find({user: req.user.userId});
  res.status(StatusCodes.OK).json({
    orders,
    count: orders.length,
  });
};

const updateOrder = async (req, res, next) => {
  const oid = req.params.id;
  const paymentIntentId = req.body.paymentIntentId;
  const order = await Order.findOne({
    _id: oid,
  });
  if (!order) {
    throw new NotFoundError('order not found');
  }
  checkPermission(req.user, order.user);

  order.paymentIntentId = paymentIntentId;
  order.status = 'paid';
  await order.save();

  res.status(StatusCodes.OK).json({
    msg: 'order updated',
  });
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
