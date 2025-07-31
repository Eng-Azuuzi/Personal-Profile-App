const { validationResult, check } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const config = require('config'); 


//get User
const getUser = async (req,res) =>{
try {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
} catch (err) {
  res.status(500).send('Server Error');
}
} 


const login = [
  // Validation
  check("email", "Please Enter A valid Email!").isEmail(),
  check("password", "Please Enter Password").exists(),

  // Controller funtion

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { email, password } = req.body;

      // check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ errors: [{ msg: "Valid Credentials" }] });
      }
      //check password
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(404).json({ errors: [{ msg: "Valid Credentials" }] });
      }

      const payload = {
        user: {
          id: user.id,
          email: user.email
        },
      };

      jwt.sign(
        payload,
        config.get('jwtSecretKey'),
        { expiresIn: '1h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );

    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: "Server Error" });
    }
  },
];

module.exports = {
  login,
  getUser
}
