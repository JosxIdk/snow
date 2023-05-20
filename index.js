const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const helmet = require("helmet");
const dotenv = require("dotenv");
const usersRoute = require("./routes/users");
const postsRoute = require("./routes/posts");
const authRoute = require("./routes/auth");
const chatsRoute = require("./routes/chats");
const messagesRoute = require("./routes/messages");
const groupsRoute = require("./routes/groups");
const hashtagsRoute = require("./routes/hashtags");
const reportsRoute = require("./routes/reports");

const app = express();
dotenv.config();

//CORS
app.use(
  cors({
    origin: "https://snowcy.com",
    optionsSuccessStatus: 200,
  })
);

//Connections

mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to MongoDB.");
  }
);

//Middlewares

app.use(express.json());
app.use(helmet());
app.use(morgan("combined"));

app.use("/api/users", usersRoute);
app.use("/api/posts", postsRoute);
app.use("/api/auth", authRoute);
app.use("/api/chats", chatsRoute);
app.use("/api/messages", messagesRoute);
app.use("/api/groups", groupsRoute);
app.use("/api/hashtags", hashtagsRoute);
app.use("/api/reports", reportsRoute);

// Leer varibles

const host = process.env.HOST || "0.0.0.0";
const port = process.env.PORT || 3000;

app.listen(port, host, () => {
  console.log("Snow backend running.");
});
