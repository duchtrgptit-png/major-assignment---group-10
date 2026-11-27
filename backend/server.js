require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("API đang chạy"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Đã kết nối MongoDB");
    app.listen(process.env.PORT, () =>
      console.log("Server chạy ở http://localhost:" + process.env.PORT),
    );
  })
  .catch((err) => console.error("Lỗi kết nối:", err.message));
