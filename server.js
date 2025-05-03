require("dotenv").config();

// server.js
const express = require("express");
const midtransClient = require("midtrans-client");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

app.post("/get-snap-token", async (req, res) => {
  try {
    const { orderId, amount, itemName, customerName, customerEmail } = req.body;

    const parameter = {
      transaction_details: {
        order_id: orderId || `order-${Date.now()}`,
        gross_amount: amount || 15000,
      },
      item_details: [
        {
          id: orderId || `item-${Date.now()}`,
          price: amount || 15000,
          quantity: 1,
          name: itemName || "Gula Aren Latte",
        },
      ],
      customer_details: {
        first_name: customerName || "User",
        email: customerEmail || "user@example.com",
      },
    };

    const transaction = await snap.createTransaction(parameter);
    res.json({ token: transaction.token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
