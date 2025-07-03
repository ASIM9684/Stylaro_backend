const favorites = require("../model/favorites");

const deleteFavorite = async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id;
    try {
        await favorites.findOneAndDelete({ userId, productId });
        res.status(200).json({ success: true, message : "Favorite Removed Successfully" });
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}
module.exports = { deleteFavorite };