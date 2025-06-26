const category = require("../model/category");
const color = require("../model/color");
const product = require("../model/product");
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const update = await category.findByIdAndUpdate(id, {
      name,
    });
    if (!update) {
      return res.status(400).json({ message: "Category Not Found" });
    }

    return res.status(200).json({ message: "Category Updated Successfully" });
  } catch (error) {
    console.log("Error Updating Category", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateColor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const update = await color.findByIdAndUpdate(id, {
      name,
    });
    if (!update) {
      return res.status(400).json({ message: "Color Not Found" });
    }

    return res.status(200).json({ message: "Color Updated Successfully" });
  } catch (error) {
    console.log("Error Updating Color", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, image, category, color, gender } = req.body;
    const existing = await product.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Product already exists" });
    }

    const updateProduct = await product.findByIdAndUpdate(id, {
      name,
      price,
      image,
      category,
      color,
      gender,
    });

    if(!updateProduct){
      return res.status(400).json({message : "No Product Found"});
    }
    res
      .status(200)
      .json({ message: "Product Updated successfully" });
  } catch (error) {
    console.error("Error Updating product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = { updateCategory, updateColor, updateProduct };
