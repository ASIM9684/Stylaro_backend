const category = require("../model/category");
const color = require("../model/color");
const product = require("../model/product");

const API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const chatboat = async (req, res) => {
  const { prompt, history = [] } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  const lowerPrompt = prompt.toLowerCase();
  const query = {};
  const sort = {};

  const allColors = await color.find().lean();
  const allCategories = await category.find().lean();

  // Match color
  const matchedColor = allColors.find(c =>
    lowerPrompt.includes(c.name.toLowerCase())
  );
  if (matchedColor) query.color = matchedColor._id;

  // Match gender
  if (/\b(men|male|man|boy|guys?)\b/i.test(lowerPrompt)) {
    query.gender = { $regex: /^(men|male|m)$/i };
  } else if (/\b(women|female|girl|ladies?)\b/i.test(lowerPrompt)) {
    query.gender = { $regex: /^(women|female|w)$/i };
  }

  // Match price sort
  if (lowerPrompt.includes("cheapest") || lowerPrompt.includes("lowest")) {
    sort.price = 1;
  } else if (lowerPrompt.includes("expensive") || lowerPrompt.includes("highest")) {
    sort.price = -1;
  }

  // Match category
  const matchedCategory = allCategories.find(cat =>
    lowerPrompt.includes(cat.name.toLowerCase())
  );
  if (matchedCategory) query.category = matchedCategory._id;

  // Name, color, category fuzzy match
  const keywordRegex = new RegExp(escapeRegExp(prompt), "i");
  const directMatches = await product.find({
    $or: [
      { name: { $regex: keywordRegex } },
    ]
  })
    .populate("category", "name")
    .populate("color", "name")
    .lean();

  // Match using filters
  const filteredMatches = await product.find(query)
    .populate("category", "name")
    .populate("color", "name")
    .sort(sort)
    .lean();

  // Merge and remove duplicates
  const allProducts = [...directMatches, ...filteredMatches];
  const seen = new Set();
  const uniqueProducts = allProducts.filter(p => {
    if (seen.has(p._id.toString())) return false;
    seen.add(p._id.toString());
    return true;
  });

  const productQueryDetected =
    directMatches.length || matchedColor || query.gender || Object.keys(sort).length || matchedCategory;

  if (!uniqueProducts.length && !productQueryDetected) {
    return res.json({
      reply: "👋 Hi there! I'm here to help with product-related questions. You can ask me about prices, colors, categories, or specific items. 😊"
    });
  }

  const formattedHistory = history
    .map(msg => `${msg.sender === "user" ? "User" : "Bot"}: ${msg.text}`)
    .join("\n");

  const formattedProducts = uniqueProducts
    .slice(0, 5)
    .map(p => `Product: ${p.name}
Price: $${p.price}
Rating: ${p.rating || "N/A"}
Gender: ${p.gender}
Category: ${p.category?.name || "N/A"}
Color: ${p.color?.name || "N/A"}
Quantity: ${p.quantity}
Image: ${p.image || "None"}
Discount: ${p.discount || "None"}`)
    .join("\n\n");

  const instruction = `
You are a smart shopping assistant AI trained to answer only about the following products:

${formattedProducts}

Here is the chat so far:
${formattedHistory}

Only answer based on this data. 
- If the question is not about any of the above products, respond: "I'm only able to answer product-related queries."
- Be friendly and conversational.
- Do NOT mention any product names unless the prompt is clearly asking about them.
- If the user **does** mention or ask about a product, do mention the product name.
If the user asks about any product, reply with the full product block like this format:

Product: Yellow Shoes  
Price: $1000  
Rating: 3  
Gender: Male  
Category: Shoes  
Color: yellow  
Quantity: 44  
Image: https://res.cloudinary.com/...  
Discount: 0
Now answer this user prompt:
"${prompt}"
`;

  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: instruction }] }],
      }),
    });

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return res.status(500).json({
        error: data.error || "No reply received from Gemini API",
        raw: data,
      });
    }

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Gemini API error:", err);
    return res.status(500).json({ error: "Error generating response" });
  }
};

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { chatboat };
