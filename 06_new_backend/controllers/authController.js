// Responsible for logic related to authentication
// External dependencies
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Internal dependencies
const User = require("../models/User");
const {
  usernameValidator,
  emailValidator,
  passwordValidator,
} = require("../dependencies/validators/User");

async function register(req, res) {
  const { username, password, email } = req.body;

  // Validate username format
  if (!usernameValidator(username)) {
    return res.status(400).json({ message: "Invalid username format" });
  }
  // Validate email format
  if (!emailValidator(email)) {
    return res.status(400).json({ message: "Invalid username format" });
  }

  // Validate password length
  if (!passwordValidator(password)) {
    return res.status(400).json({ message: "Invalid password length" });
  }

  try {
    // Check if username already exists in the database
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user document
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
    });

    // Save the new user document to the database
    await newUser.save();

    // Respond with success message
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Login a user
async function login(req, res) {
  const { username, password } = req.body;
  // console.log(username);

  // Validate username format
  if (!usernameValidator(username)) {
    return res.status(400).json({ message: "Invalid username format" });
  }

  // Validate password length
  if (!passwordValidator(password)) {
    return res.status(400).json({ message: "Invalid password length" });
  }

  try {
    const user = await User.findOne({ username: username });
    console.log(user);
    if (!user) {
      return res.status(401).json({ message: "Invalid user" });
    }

    // console.log(password)
    // if (password === user.password) {
    //   const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    //   console.log("TOKEN GENERATED")
    //   res.json({ token });
    // }
    // else {
    //   res.status(401).json({ message: 'Invalid password' });
    // }
    const validPassword = bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.json({ success: false, message: "passwords do not match" });
    } else if (validPassword) {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      console.log("TOKEN GENERATED");
      return res.json({ token });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { register, login };
