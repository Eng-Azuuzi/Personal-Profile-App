const express = require('express');
const router = express.Router();
const authController = require('../../controller/AuthController');
const verify = require('../../middleware/verifyToken');

router
    .route('/')
    .post(authController.login)
    .get(verify,authController.getUser);

module.exports = router;
