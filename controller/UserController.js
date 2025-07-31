const express = require("express");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");

//Register User
const registerUser =
  // Validation middleware
  [
    check("name", "Name is required!").not().isEmpty(),
    check("email", "Please include A valid Email").isEmail(),
    check(
      "password",
      "Please Enter password with 6 or more character"
    ).isLength({ min: 6 }),

    // Controller Function
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { name, email, password } = req.body;
      try {
        //See if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res
            .status(400)
            .json({ errors: [{ msg: "User already exists" }] });
        };

        //Get User's gravator
        const avatar =
        `https:${gravatar.url(email, {
            s: "200", // Size: 200px
            r: "pg", // Rating: PG
            d: "mm", // Default: mystery-man silhouette
          })
        }`;

        console.log(avatar);

        const user = new User({
          name,
          email,
          password,
          avatar,
        });
        //Password encryption
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        const payload = {
          user: {
            id: user.id,
            email: user.email,
          },
        };

        jwt.sign(
          payload,
          config.get("jwtSecretKey"),
          { expiresIn: "1h" },
          (err, token) => {
            if (err) throw err;
            res.json({ token });
          }
        );
      } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
      }
    },
  ];

module.exports = {
  registerUser,
};
