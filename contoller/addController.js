const category = require("../model/category");
const color = require("../model/color");
const complain = require("../model/complain");
const Product = require("../model/product");

const addProduct = async (req, res) => {
  try {
    const { name, price, image, category, color, gender } = req.body;
    const existing = await Product.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Product already exists" });
    }

    const newProduct = new Product({
      name,
      price,
      image,
      category,
      color,
      gender,
    });

    await newProduct.save();

    res
      .status(201)
      .json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const exist = await category.findOne({ name });
    if (exist) {
      return res.status(400).json({ message: "Category already Exist" });
    }
    const addCategory = new category({
      name,
    });
    await addCategory.save();
    return res.status(201).json({ message: "Category added Successfully" });
  } catch (error) {
    console.log("Error Adding category:", error);

    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const addColor = async (req, res) => {
  try {
    const { name } = req.body;

    const exist = await color.findOne({ name });
    if (exist) {
      return res.status(400).json({ message: "Color already Exist" });
    }
    const addColor = new color({
      name,
    });
    await addColor.save();
    return res.status(201).json({ message: "Color added Successfully" });
  } catch (error) {
    console.log("Error Adding Color:", error);

    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const addComplain = async (req, res) => {
  try {
    const { subject, message } = req.body;

    // if (!req.user || !req.user._id) {
    //   return res
    //     .status(40)
    //     .json({ message: "Unauthorized: User not authenticated" });
    // }

    if (!subject || !message) {
      return res
        .status(400)
        .json({ message: "Subject and message are required." });
    }

    const newComplain = new complain({
      subject,
      message,
      userId: req.user._id,
    });

    await newComplain.save();
    return res
      .status(201)
      .json({ message: "Your complaint has been received" });
  } catch (error) {
    console.error("Add Complain Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { addProduct, addCategory, addColor, addComplain };
