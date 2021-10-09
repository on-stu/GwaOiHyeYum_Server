import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import user from "./routes/user.js";
import classes from "./routes/class.js";
import quiz from "./routes/quiz.js";

const app = express();
const __dirname = path.resolve();
const root = path.join(__dirname, "/build");

app.use(bodyParser.json({ extended: true, limit: 5000000 }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,content-type,application/json"
  );
  next();
});
app.use(cors());
app.use("/", express.static(root));

app.use("/auth", user);
app.use("/class", classes);
app.use("/quiz", quiz);

const CONNECTION_URL =
  "mongodb+srv://admin:ehdgoanf1!@youtubeclone.dbev2.mongodb.net/HyeYum?retryWrites=true&w=majority";
const PORT = process.env.PORT || 5000;

mongoose
  .connect(CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
  })
  .catch((error) => {
    console.log(error);
  });
