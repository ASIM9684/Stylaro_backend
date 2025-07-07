const { default: mongoose } = require("mongoose");
const category = require("../model/category");
const color = require("../model/color");
const Product = require("../model/product");
const complain = require("../model/complain");
const favorites = require("../model/favorites");
const user = require("../model/user");
const order = require("../model/order");
const product = require("../model/product");

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
          discount: 1,
          quantity: 1,
          rating: 1,
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
          discount: 1,
          quantity: 1,
          rating: 1,
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
        $match: { userId: id },
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

const getFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    const favorite = await favorites.find({ userId });
    res.status(200).json(favorite.map(fav => fav.productId));
  } catch (err) {
    console.log("Error Fetching Favorites", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
const getUsers = async (req, res) => {
  try {
    const userdata = await user.find();
    return res.status(200).json(userdata);
  } catch (error) {
    console.log("Error Fetching User: ", error);
    return res.status(500).json({ message: "Internal Server Error" })
  }
}
const getOrder = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.id)
    const orderData = await order.aggregate([
      {
        $match: {
          userId: userId
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $group: {
          _id: "$_id",
          userId: { $first: "$userId" },
          user: { $first: "$user" },
          address: { $first: "$address" },
          totalAmount: { $first: "$totalAmount" },
          paymentStatus: { $first: "$paymentStatus" },
          paymentIntentId: { $first: "$paymentIntentId" },
          deliveryStatus: { $first: "$deliveryStatus" },
          createdAt: { $first: "$createdAt" },
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $project: {
          address: 1,
          name: "$user.name",
          totalAmount: 1,
          paymentStatus: 1,
          deliveryStatus: 1,
          createdAt: 1
        }
      }

    ]);

    return res.status(200).json(orderData);
  } catch (error) {
    console.log("Error Fetching Order: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getOrderProduct = async (req, res) => {
  try {
    const _id = new mongoose.Types.ObjectId(req.params.id);
    const orderData = await order.aggregate([
      { $match: { _id } },

      { $unwind: "$items" },

      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: "$productInfo" },

      // Join with category
      {
        $lookup: {
          from: "categories",
          localField: "productInfo.category",
          foreignField: "_id",
          as: "categoryInfo"
        }
      },
      { $unwind: "$categoryInfo" },

      // Join with color
      {
        $lookup: {
          from: "colors",
          localField: "productInfo.color",
          foreignField: "_id",
          as: "colorsInfo"
        }
      },
      { $unwind: "$colorsInfo" },

      {
        $addFields: {
          "items.product": "$productInfo",
          "items.category": "$categoryInfo",
          "items.color": "$colorsInfo",
          "items.price": "$items.price",
          "items.quantity": "$items.quantity"
        }
      },

      {
        $group: {
          _id: "$_id",
          items: { $push: "$items" },
          totalAmount: { $first: "$totalAmount" },
          createdAt: { $first: "$createdAt" }
        }
      },

      {
        $project: {
          _id: 1,
          totalAmount: 1,
          createdAt: 1,
          items: {
            $map: {
              input: "$items",
              as: "item",
              in: {
                productName: "$$item.product.name",
                originalPrice: { $toDouble: "$$item.price" },
                quantity: "$$item.quantity",
                image: "$$item.product.image",
                category: "$$item.category.name",
                color: "$$item.color.name",
                gender: "$$item.product.gender",
                productCreatedAt: "$$item.product.createdAt",
                productUpdatedAt: "$$item.product.updatedAt",
              }
            }
          }
        }
      }
    ]);

    return res.status(200).json(orderData[0] || {});
  } catch (error) {
    console.error("Error Fetching Order Products:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const monthlyOrderChart = async (req, res) => {
  try {
    const monthlyOrders = await order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $sort: { "_id": 1 },
      },
    ]);

    const months = [
      "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const chartData = monthlyOrders.map((entry) => ({
      month: months[entry._id],
      orders: entry.orderCount,
    }));

    res.json(chartData);
  } catch (err) {
    console.error("Error fetching monthly order data", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getDashboardCount = async (req, res) => {
  try {
    const productCount = await product.countDocuments();
    const userCount = await user.countDocuments();
    const orderCount = await order.countDocuments();

    res.status(200).json({
      productCount,
      userCount,
      orderCount,
    });
  } catch (error) {
    console.error("Dashboard count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
    });
  }
};

module.exports = {
  getDashboardCount,
  getCategories,
  getColors,
  getProducts,
  getProductbyId,
  getComplains,
  getComplainsbyUser,
  getFavorites,
  getUsers,
  getOrder,
  getOrderProduct,
  monthlyOrderChart
};
