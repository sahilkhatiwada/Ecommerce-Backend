import express from "express";
import { isBuyer } from "../middleware/authentication.middleware.js";
import {
  addProductToCartValidationSchema,
  updateItemQuantitySchema,
} from "./cart.validation.js";
import Product from "../product/product.model.js";
import Cart from "./cart.model.js";
import mongoose from "mongoose";
import { checkMongoIdValidity } from "../utils/check.mongo.id.validity.js";

const router = express.Router();

// add item to cart
router.post(
  "/cart/add/item",
  isBuyer,
  async (req, res, next) => {
    // extract item from req.body
    const item = req.body;

    // validate item
    try {
      const validatedData = await addProductToCartValidationSchema.validate(
        item
      );

      req.body = validatedData;

      next();
    } catch (error) {
      return res.status(400).send({ message: error.message });
    }
  },
  async (req, res) => {
    // extract item from req.body
    const item = req.body;

    item.buyerId = req.loggedInUserId;

    // check productId for mongo id validity
    const isValidMongoId = mongoose.Types.ObjectId.isValid(item.productId);

    // if not valid mongo id
    if (!isValidMongoId) {
      return res.status(400).send({ message: "Invalid mongo id" });
    }

    // check if product exists
    const product = await Product.findOne({ _id: item.productId });

    // if not product, throw error
    if (!product) {
      return res.status(404).send({ message: "Product does not exist." });
    }

    // check for product quantity

    // if quantity not available, throw error
    if (item.orderedQuantity > product.quantity) {
      return res.status(422).send({ message: "Product is out numbered." });
    }

    // check if product is already added for this user
    const cartItem = await Cart.findOne({
      productId: item.productId,
      buyerId: item.buyerId,
    });

    if (cartItem) {
      return res.status(409).send({ message: "Item is already added." });
    }

    // add item

    await Cart.create(item);

    // send res
    return res
      .status(200)
      .send({ message: "Item is added to cart successfully." });
  }
);

// update quantity
router.put(
  "/cart/item/update-quantity",
  isBuyer,
  async (req, res, next) => {
    // get updateData from req.body
    const updateData = req.body;

    // validate updateData

    try {
      const validatedData = await updateItemQuantitySchema.validate(updateData);

      req.body = validatedData;

      next();
    } catch (error) {
      return res.status(400).send({ message: error.message });
    }
  },
  async (req, res) => {
    // extract update data from req.body
    const updateData = req.body;

    // check productId for mongo id validity
    const isValidMongoId = mongoose.Types.ObjectId.isValid(
      updateData.productId
    );

    // if not valid mongo id
    if (!isValidMongoId) {
      return res.status(400).send({ message: "Invalid mongo id" });
    }
    // find product using product Id
    const product = await Product.findOne({ _id: updateData.productId });

    // if not product, throw error
    if (!product) {
      return res.status(404).send({ message: "Product does not exist." });
    }

    // find cart item using productId and buyerId
    const cartItem = await Cart.findOne({
      buyerId: req.loggedInUserId,
      productId: updateData.productId,
    });

    if (!cartItem) {
      return res
        .status(409)
        .send({ message: "Please add item to cart first." });
    }

    // quantity verification
    const newOrderedQuantity =
      updateData.action === "inc"
        ? cartItem.orderedQuantity + 1
        : cartItem.orderedQuantity - 1;

    if (newOrderedQuantity > product.quantity) {
      return res.status(422).send({ message: "Product is outnumbered." });
    }

    if (newOrderedQuantity < 1) {
      return res
        .status(422)
        .send({ message: "Item quantity should be at least 1." });
    }

    // update quantity
    await Cart.updateOne(
      { productId: updateData.productId, buyerId: req.loggedInUserId },
      {
        $set: {
          orderedQuantity: newOrderedQuantity,
        },
      }
    );
    // send response

    return res.status(200).send({ message: "Quantity is updated." });
  }
);

// remove cart item
router.delete(
  "/cart/remove/:id",
  isBuyer,
  checkMongoIdValidity,
  async (req, res) => {
    // extract product id from req.params
    const cartId = req.params.id;

    // delete that product from cart
    await Cart.deleteOne({ _id: cartId, buyerId: req.loggedInUserId });

    // send response
    return res.status(200).send({ message: "Item is removed from cart." });
  }
);

// flush cart
router.delete("/cart/flush", isBuyer, async (req, res) => {
  // delete cart items for this buyer
  await Cart.deleteMany({ buyerId: req.loggedInUserId });

  //   send response
  return res.status(200).send({ message: "Cart is flushed successfully." });
});

// item list from cart
router.get("/cart/item/list", isBuyer, async (req, res) => {
  const cartItems = await Cart.aggregate([
    {
      $match: {
        buyerId: req.loggedInUserId,
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "productData",
      },
    },
    {
      $project: {
        orderedQuantity: 1,
        name: { $first: "$productData.name" },
        brand: { $first: "$productData.brand" },
        category: { $first: "$productData.category" },
        price: { $first: "$productData.price" },
        image: { $first: "$productData.image" },
        productId: 1,
      },
    },
  ]);

  let subTotal = 0;

  cartItems.forEach((item) => {
    subTotal = subTotal + item.price * item.orderedQuantity;
  });

  const discount = (5 / 100) * subTotal;

  const grandTotal = subTotal - discount;

  return res.status(200).send({
    message: "success",
    cartData: cartItems,
    orderSummary: { subTotal, grandTotal, discount },
  });
});

// cart item count
router.get("/cart/item/count", isBuyer, async (req, res) => {
  const buyerId = req.loggedInUserId;

  const cartCount = await Cart.find({ buyerId: buyerId }).count();

  return res.status(200).send({ message: "success", cartItemCount: cartCount });
});
export default router;
