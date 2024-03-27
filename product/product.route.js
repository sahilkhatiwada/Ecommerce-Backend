import express from "express";
import {
  isBuyer,
  isSeller,
  isUser,
} from "../middleware/authentication.middleware.js";
import { checkProductOwnerShip } from "../middleware/check.product.ownership.js";
import { validateReqBody } from "../middleware/validation.middleware.js";
import { checkMongoIdValidity } from "../utils/check.mongo.id.validity.js";
import Product from "./product.model.js";
import {
  buyerPaginationSchema,
  paginationSchema,
  productSchema,
} from "./product.validation.js";
import Cart from "../cart/cart.model.js";

const router = express.Router();

// add product
router.post(
  "/product/add",
  isSeller,
  validateReqBody(productSchema),
  async (req, res) => {
    //    extract new product from req.body
    const newProduct = req.body;

    // we need logged in user id for product owner id
    newProduct.ownerId = req.loggedInUser._id;

    // create product
    await Product.create(newProduct);

    return res.status(200).send({ message: "Product is added successfully." });
  }
);

// get product details
router.get(
  "/product/details/:id",
  isUser,
  checkMongoIdValidity,
  async (req, res) => {
    // extract id from req.params
    const productId = req.params.id;

    // find product
    const requiredProduct = await Product.findOne({ _id: productId });

    // if not product, throw error

    if (!requiredProduct) {
      return res.status(404).send({ message: "Product does not exist." });
    }

    //   hide ownerId
    requiredProduct.ownerId = undefined;

    // send product details as response
    return res
      .status(200)
      .send({ message: "success", product: requiredProduct });
  }
);

// delete product
router.delete(
  "/product/delete/:id",
  isSeller,
  checkMongoIdValidity,
  checkProductOwnerShip,
  async (req, res) => {
    // extract id from req.params
    const productId = req.params.id;

    // delete product
    await Product.deleteOne({ _id: productId });

    // also remove this product from cart
    await Cart.deleteMany({ productId: productId });

    return res
      .status(200)
      .send({ message: "Product is deleted successfully." });
  }
);

// edit product
router.put(
  "/product/edit/:id",
  isSeller,
  checkMongoIdValidity,
  validateReqBody(productSchema),
  checkProductOwnerShip,
  async (req, res) => {
    // extract id from req.params
    const productId = req.params.id;

    // extract new values from req.body
    const newValues = req.body;

    // update product
    await Product.updateOne({ _id: productId }, { $set: { ...newValues } });

    // send response
    return res
      .status(200)
      .send({ message: "Product is updated successfully." });
  }
);

// get product list by buyer
router.post(
  "/product/buyer/list",
  isBuyer,
  validateReqBody(buyerPaginationSchema),
  async (req, res) => {
    // extract pagination data from req.body
    const { page, limit, searchText, category, minPrice, maxPrice } = req.body;

    // calculate skip
    const skip = (page - 1) * limit;

    // filter stage
    let match = {};

    if (searchText) {
      match = { name: { $regex: searchText, $options: "i" } };
    }

    if (category) {
      match = { ...match, category: category };
    }

    if (minPrice && maxPrice) {
      match = { ...match, price: { $gte: minPrice, $lte: maxPrice } };
    }

    // query
    const products = await Product.aggregate([
      {
        $match: match,
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $project: {
          name: 1,
          price: 1,
          brand: 1,
          image: 1,
          description: { $substr: ["$description", 0, 200] },
        },
      },
    ]);

    // calculate number of page
    const totalProduct = await Product.find(match).countDocuments();

    const numberOfPages = Math.ceil(totalProduct / limit);
    // send res

    return res
      .status(200)
      .send({ message: "success", products: products, numberOfPages });
  }
);

// get product list by seller
router.post(
  "/product/seller/list",
  isSeller,
  validateReqBody(paginationSchema),
  async (req, res) => {
    // extract pagination data from req.body
    const { page, limit, searchText } = req.body;

    // calculate skip
    const skip = (page - 1) * limit;

    // filter stage
    let match = { ownerId: req.loggedInUserId };

    if (searchText) {
      match = {
        ownerId: req.loggedInUserId,
        name: { $regex: searchText, $options: "i" },
      };
    }

    let products = await Product.aggregate([
      {
        $match: match,
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: skip,
      },
      { $limit: limit },
      {
        $project: {
          name: 1,
          brand: 1,
          price: 1,
          image: 1,
          description: { $substr: ["$description", 0, 200] },
        },
      },
    ]);

    // calculate number of page
    const totalProduct = await Product.find(match).countDocuments();

    const numberOfPages = Math.ceil(totalProduct / limit);

    // send res
    return res
      .status(200)
      .send({ message: "success", products: products, numberOfPages });
  }
);
export default router;
