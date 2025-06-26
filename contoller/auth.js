const user = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exist = await user.findOne({ email });
    if (exist) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashpass = await bcrypt.hash(password, 10);

    const newUser = new user({
      name,
      email,
      password: hashpass,
    });
    await newUser.save();

    const token = jwt.sign(
      {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    return res
      .status(201)
      .json({ message: "Signup successful. Your now log in.", token });
  } catch (error) {
    console.error("Error signing up:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const exist = await user.findOne({ email });
    if (!exist) {
      return res.status(400).json({ message: "No User Found" });
    }

    const pass = await bcrypt.compare(password, exist.password);

    if (!pass) {
      return res.status(400).json({ message: "Incorrect Password" });
    }

    const token = jwt.sign(
      {
        _id: exist._id,
        name: exist.name,
        email: exist.email,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error signing up:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
module.exports = { signup, login };
