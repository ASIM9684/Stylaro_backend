const express = require("express");
const {
  addProduct,
  addCategory,
  addColor,
  addComplain,
} = require("../contoller/addController");
const { getCategories, getColors, getProducts, getProductbyId, getComplains, getComplainsbyUser } = require("../contoller/fetchContoller");
const { updateCategory, updateColor, updateProduct } = require("../contoller/updateContoller");
const { signup, login, verifyToken } = require("../contoller/auth");
const router = express.Router();

router.post("/add-product",verifyToken, addProduct);
router.post("/add-category",verifyToken, addCategory);
router.post("/add-color",verifyToken, addColor);
router.post("/add-complain",verifyToken, addComplain);
router.post("/signUp",signup);
router.post("/login",login);

router.get("/categories", getCategories);
router.get("/colors", getColors);
router.get("/product", getProducts);
router.get("/getProductbyId/:id", getProductbyId);
router.get("/complain",verifyToken,getComplains)
router.get("/getComplainsbyUser",verifyToken, getComplainsbyUser);

router.put("/updateCategory/:id",verifyToken, updateCategory);
router.put("/updateColor/:id", verifyToken,updateColor);
router.put("/updateProduct/:id",verifyToken, updateProduct);



module.exports = router;
