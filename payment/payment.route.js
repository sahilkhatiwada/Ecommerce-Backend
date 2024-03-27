import express from "express";
import { isBuyer } from "../middleware/authentication.middleware.js";
import axios from "axios";
import Order from "../order/order.model.js";
import Cart from "../cart/cart.model.js";
import { uuid } from "uuidv4";
const router = express.Router();

// start payment
router.post("/payment/khalti/start", isBuyer, async (req, res) => {
  const { amount, productList } = req.body;

  //   buyer id
  const buyerId = req.loggedInUserId;

  try {
    // initiate a payment
    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/initiate/",
      {
        return_url: "http://localhost:5173/payment/khalti/success/",
        website_url: "http://localhost:5173/",
        amount: +amount * 100, //paisa
        purchase_order_id: uuid(),
        purchase_order_name: "items",
      },
      {
        headers: {
          Authorization: "key 132661f9aaf04e47868838590e6fe5a1",
          "Content-Type": "application/json",
        },
      }
    );

    const pidx = response?.data?.pidx;

    //   create order
    await Order.create({
      buyerId,
      productList,
      totalAmount: amount,
      pidx,
      paymentStatus: "Initiated",
    });

    return res
      .status(200)
      .send({ message: "success", paymentInfo: response.data });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});

router.post("/payment/khalti/success", isBuyer, async (req, res) => {
  // extract pidx from req.body
  const { pidx } = req.body;

  // hit look up api from khalti

  try {
    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      {
        pidx,
      },
      {
        headers: {
          Authorization: "key 132661f9aaf04e47868838590e6fe5a1",
          "Content-Type": "application/json",
        },
      }
    );

    await Order.updateOne(
      { pidx },
      {
        $set: {
          paymentStatus: response?.data?.status,
        },
      }
    );

    if (response?.data?.status !== "Completed") {
      return res.status(500).send({ message: "Payment is unsuccessful." });
    }

    await Cart.deleteMany({ buyerId: req.loggedInUserId });

    return res.status(200).send({ message: response?.data?.status });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});
export default router;
