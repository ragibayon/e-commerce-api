const express = require('express');

const {
  createOrder,
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  updateOrder,
} = require('./../controllers/orderController');
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');
const router = express.Router();

router
  .route('/')
  .get([authenticateUser, authorizePermissions('admin')], getAllOrders)
  .post([authenticateUser, authorizePermissions('user')], createOrder);
router
  .route('/showAllMyOrders')
  .get([authenticateUser, authorizePermissions('user')], getCurrentUserOrders);
router
  .route('/:id')
  .get([authenticateUser, authorizePermissions('user')], getSingleOrder)
  .patch([authenticateUser, authorizePermissions('user')], updateOrder);

module.exports = router;
