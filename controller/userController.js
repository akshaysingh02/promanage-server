const User = require("../models/userModel");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        errorMessage: "Bad Request, form fields can't be empty",
      });
    }
    let formattedEmail = email.toLowerCase();

    const isExistingUser = await User.findOne({ email: formattedEmail });
    if (isExistingUser) {
      return res.status(409).json({ errorMessage: "User already exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const UserData = new User({
      name,
      email: formattedEmail,
      password: hashedPassword,
    });
    await UserData.save();
    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.log(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        errorMessage: "Bad Request, form fields can't be empty",
      });
    }

    //check if user exist in database
    const userDetails = await User.findOne({ email: email });
    if (!userDetails) {
      return res.status(409).json({ errorMessage: "User doesn't exist" });
    }

    //compare the password
    const isPasswordMatched = await bcrypt.compare(
      password,
      userDetails.password
    );

    if (!isPasswordMatched) {
      return res.status(401).json({ errorMessage: "Invalid credentials" });
    }

    //set token
    var token = jwt.sign({ userId: userDetails._id }, process.env.SECRET_KEY, {
      expiresIn: "60h",
    });

    res.json({
      message: "User Logged In",
      token: token,
      userId: userDetails._id,
      name: userDetails.name,
    });
  } catch (error) {
    console.log("Can't login",error);
  }
};

module.exports = {
  signup,
  login,
};
