import Yup from "yup";

export let addProductToCartValidationSchema = Yup.object({
  productId: Yup.string().required("Product id is required.").trim(),
  orderedQuantity: Yup.number()
    .required()
    .positive("Quantity must be at least 1."),
});

export let updateItemQuantitySchema = Yup.object({
  productId: Yup.string().required("Product id is required.").trim(),
  action: Yup.string().oneOf(["inc", "dec"]).required("Action is required."),
});
