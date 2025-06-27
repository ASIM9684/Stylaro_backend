const { default: mongoose } = require("mongoose");
const category = require("../model/category");
const color = require("../model/color");
const Product = require("../model/product");
const complain = require("../model/complain");

const getProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $lookup: {
          from: "colors",
          localField: "color",
          foreignField: "_id",
          as: "colors",
        },
      },
      {
        $unwind: "$colors",
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          image: 1,
          gender: 1,
          color: "$colors.name",
          category: "$category.name",
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    return res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getProductbyId = async (req, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const products = await Product.aggregate([
      {
        $match: { _id: id },
      },
      {
        $lookup: {
          from: "colors",
          localField: "color",
          foreignField: "_id",
          as: "colors",
        },
      },
      {
        $unwind: "$colors",
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          image: 1,
          gender: 1,
          color: "$colors._id",
          category: "$category._id",
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    return res.status(200).json(products[0]);
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

async function getCategories(req, res) {
  try {
    const categories = await category.find();
    return res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

const getColors = async (req, res) => {
  try {
    const colors = await color.find();
    return res.status(200).json(colors);
  } catch (error) {
    console.error("Error fetching colors:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getComplains = async (req, res) => {
  try {
    const complaindata = await complain.aggregate([
      {
        $lookup: {
          from: "users", 
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          message: 1,
          subject: 1,
          userName: "$user.name",
          userEmail: "$user.email",
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);
    return res.status(200).json(complaindata);
  } catch (error) {
    console.log("Error Fetching Complain", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


const getComplainsbyUser = async (req, res) => {
  try {
     const id = new mongoose.Types.ObjectId(req.user._id);
    const complaindata = await complain.aggregate([
      {
        $match : {userId : id}
      },
      {
        $lookup: {
          from: "users", 
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          message: 1,
          subject: 1,
          userName: "$user.name",
          userEmail: "$user.email",
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);
    return res.status(200).json(complaindata);
  } catch (error) {
    console.log("Error Fetching Complain", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports = {
  getCategories,
  getColors,
  getProducts,
  getProductbyId,
  getComplains,
  getComplainsbyUser
};
