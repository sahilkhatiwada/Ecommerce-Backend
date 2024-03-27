import Product from "../product/product.model.js";

export const checkProductOwnerShip = async (req, res, next) => {
  const productId = req.params.id;

  // find product
  const product = await Product.findOne({ _id: productId });

  //   if not product, throw error

  if (!product) {
    return res.status(404).send({ message: "Product does not exist." });
  }

  //   check product ownership
  const isOwnerOfProduct = req.loggedInUserId.equals(product.ownerId);

  if (!isOwnerOfProduct) {
    return res
      .status(403)
      .send({ message: "You are not owner of this product." });
  }

  next();
};
