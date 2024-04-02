import express from "express";
import userRoutes from "./user/user.route.js";
import connectDB from "./connect.db.js";
import productRoutes from "./product/product.route.js";
import cartRoutes from "./cart/cart.route.js";
import cors from "cors";
import paymentRoutes from "./payment/payment.route.js";
import orderRoutes from "./order/order.route.js";
import resetPasswordRoutes from "./user/reset.password.route.js";
const app = express();
// to make app understand json
app.use(express.json());

// cors
app.use(cors());

// connect database
connectDB();

// register routes
app.use(userRoutes);
app.use(productRoutes);
app.use(cartRoutes);
app.use(paymentRoutes);
app.use(orderRoutes);
app.use(resetPasswordRoutes);

// port
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
