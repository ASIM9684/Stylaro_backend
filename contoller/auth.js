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
      role: "user",
      isVerified: false,
      verificationToken: null,
      status: "unverified",
    });
    await newUser.save();

    const token = jwt.sign(
      {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
        isVerified: newUser.isVerified,
        status: newUser.status,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "30d",
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
    if (exist.status == "banned") {
      return res.status(400).json({ message: "You Got Banned by Stylaro" });
    }

    const token = jwt.sign(
      {
        _id: exist._id,
        name: exist.name,
        email: exist.email,
        role: exist.role,
        createdAt: exist.createdAt,
        isVerified: exist.isVerified,
        status: exist.status,
        image: exist.image,
        address: exist.address
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "30d",
      }
    );

    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error Login:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: Invalid User" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid User" });
  }
};
const verifyUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      req.user = decoded;
      const userData = await user.findOne({ _id: decoded._id });
      
      if (userData.status == "banned") {
        return res.status(401).json({ message: "You Got Banned by Stylaro" })
      }
    } catch (error) {
      console.warn("Invalid token:", error.message);
      return res.status(401).json({ message: "Unauthorized: Invalid Token" });
    }
  }

  next();
};

const updateuser = async (req, res) => {
  try {
    const { name, address, image } = req.body;
    const _id = req.user._id;

    if (!name) {
      return res.status(400).json({ message: "User name is Required" });
    }
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (address !== undefined && address !== null) updateData.address = address;
    if (image !== undefined && image !== null) updateData.image = image;

    const updateUser = await user.findByIdAndUpdate(_id, updateData, {
      new: true,
    });

    if (!updateUser) {
      return res.status(400).json({ message: "User Not Found" });
    }

    const token = jwt.sign(
      {
        _id: updateUser._id,
        name: updateUser.name,
        email: updateUser.email,
        role: updateUser.role,
        createdAt: updateUser.createdAt,
        isVerified: updateUser.isVerified,
        status: updateUser.status,
        image: updateUser.image,
        address: updateUser.address
      },
      process.env.SECRET_KEY,
      { expiresIn: "30d" }
    );

    return res.status(200).json({
      message: "User Updated Successfully",
      token,
    });
  } catch (error) {
    console.error("Error updating user", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { signup, login, verifyToken, updateuser, verifyUser };
