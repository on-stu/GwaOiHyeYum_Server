import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import user from "./routes/user.js";
import path from "path";

const app = express();
const __dirname = path.resolve();
const root = path.join(__dirname, "/build");

app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use("/", express.static(root));

app.get("*", (_, res) => {
  res.sendFile("index.html", { root });
});

app.use("/auth", user);

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
