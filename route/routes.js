const express = require("express");
const {
  addProduct,
  addCategory,
  addColor,
  addComplain,
  addFavorite,
  orderproduct,
} = require("../contoller/addController");
const { getCategories, getColors, getProducts, getProductbyId, getComplains, getComplainsbyUser, getFavorites, getUsers, getOrder, getOrderProduct, monthlyOrderChart, getDashboardCount } = require("../contoller/fetchContoller");
const { updateCategory, updateColor, updateProduct, updateUserStatus, updateOrderStatus } = require("../contoller/updateContoller");
const { signup, login, verifyToken, updateuser, verifyUser } = require("../contoller/auth");
const { deleteFavorite } = require("../contoller/deleteController");
const router = express.Router();

router.post("/add-product",verifyToken, addProduct);
router.post("/add-category",verifyToken, addCategory);
router.post("/add-color",verifyToken, addColor);
router.post("/add-complain",verifyToken, addComplain);
router.post("/signUp",signup);
router.post("/login",login);
router.post("/updateUser",verifyToken,updateuser);
router.post("/addFavorite",verifyToken,addFavorite);
router.post("/order",verifyToken, orderproduct);

router.get("/categories",verifyUser, getCategories);
router.get("/colors",verifyUser, getColors);
router.get("/product",verifyUser, getProducts);
router.get("/getProductbyId/:id", getProductbyId);
router.get("/complain",verifyToken,getComplains)
router.get("/getComplainsbyUser",verifyToken, getComplainsbyUser);
router.get("/getFavorites",verifyToken, getFavorites);
router.get("/getUser",verifyToken,getUsers);
router.get("/getOrder/:id",getOrder);
router.get("/getOrderProduct/:id",getOrderProduct);
router.get("/monthlyOrderChart",verifyToken, monthlyOrderChart);
router.get("/getDashboardCount",verifyToken,getDashboardCount);

router.put("/updateCategory/:id",verifyToken, updateCategory);
router.put("/updateColor/:id", verifyToken,updateColor);
router.put("/updateProduct/:id",verifyToken, updateProduct);
router.put("/updateUserStatus/:id",verifyToken, updateUserStatus);
router.put("/updateOrderStatus/:id",verifyToken, updateOrderStatus);

router.delete("/deleteFavorite/:productId",verifyToken, deleteFavorite);


module.exports = router;
