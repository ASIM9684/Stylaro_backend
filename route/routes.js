const express = require("express");
const {
  addProduct,
  addCategory,
  addColor,
  addGender,
} = require("../contoller/addController");
const { getCategories, getColors, getProducts, getProductbyId } = require("../contoller/fetchContoller");
const { updateCategory, updateColor, updateProduct } = require("../contoller/updateContoller");
const { signup, login } = require("../contoller/auth");
const router = express.Router();

router.post("/add-product", addProduct);
router.post("/add-category", addCategory);
router.post("/add-color", addColor);
router.post("/signUp",signup);
router.post("/login",login);

router.get("/categories", getCategories);
router.get("/colors", getColors);
router.get("/product", getProducts);
router.get("/getProductbyId/:id", getProductbyId);

router.put("/updateCategory/:id", updateCategory);
router.put("/updateColor/:id", updateColor);
router.put("/updateProduct/:id", updateProduct);



module.exports = router;
