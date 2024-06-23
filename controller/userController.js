const User = require("../models/userModel");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

const signup = async (req, res) => {
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

const login = async (req, res) => {
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
    var token = jwt.sign(
      { userId: userDetails._id, emailId: userDetails.email },
      process.env.SECRET_KEY,
      {
        expiresIn: "60h",
      }
    );

    res.json({
      message: "User Logged In",
      token: token,
      userId: userDetails._id,
      name: userDetails.name,
      userEmail: userDetails.email,
    });
  } catch (error) {
    console.log("Can't login", error);
  }
};

const updateUserDetailsById = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ errorMessage: "User id is required" });
    }

    const { name, email, oldPassword, newPassword } = req.body;

    // Check if user exists in the database
    const userDetails = await User.findById(userId);
    if (!userDetails) {
      return res.status(404).json({ errorMessage: "Can't find user by id" });
    }

    // Update fields
    let updateFields = {};

    if (name) {
      updateFields.name = name;
    }

    if (email) {
      let formattedEmail = email.toLowerCase();
      const isExistingUser = await User.findOne({ email: formattedEmail });
      if (isExistingUser && isExistingUser._id.toString() !== userId) {
        return res
          .status(409)
          .json({ errorMessage: "This email is already in use" });
      }
      updateFields.email = formattedEmail;
    }

    if (oldPassword && !newPassword) {
      return res
        .status(404)
        .json({ errorMessage: "Please enter old and new password" });
    }
    if (!oldPassword && newPassword) {
      return res
        .status(404)
        .json({ errorMessage: "Please enter old and new password" });
    }

    if (oldPassword && newPassword) {
      // Check if old password is correct
      const isPasswordMatched = await bcrypt.compare(
        oldPassword,
        userDetails.password
      );
      if (!isPasswordMatched) {
        return res
          .status(401)
          .json({ errorMessage: "Old password is not correct" });
      }

      // Check if new and old password are different
      if (newPassword === oldPassword) {
        return res
          .status(401)
          .json({ errorMessage: "Old and new password can't be same" });
      }

      // Hash the new password
      updateFields.password = await bcrypt.hash(newPassword, 10);
    }

    // Check if there is at least one field to update
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ errorMessage: "No fields to update" });
    }

    await User.updateOne({ _id: userId }, { $set: updateFields });

    res.json({
      message: "User details updated successfully",
      updatedFields: updateFields,
    });
  } catch (error) {
    console.log("Can't update user details", error);
    res
      .status(500)
      .json({ errorMessage: "Server error, please try again later" });
  }
};

module.exports = {
  signup,
  login,
  updateUserDetailsById,
};
