import express from "express";
import ClassModel from "../models/ClassModel.js";
import UserModel from "../models/UserModel.js";

const router = express.Router();

router.post("/getClasses", async (req, res) => {
  const {
    body: { _id },
  } = req;
  const userClasses = await ClassModel.find({ teacherId: _id }).lean();
  res.send({ status: "succsess", userClasses });
});

router.post("/getClass", async (req, res) => {
  const {
    body: { id },
  } = req;
  const thisClass = await ClassModel.find({ _id: id }).lean();
  res.send({ status: "success", thisClass });
});

router.post("/create", async (req, res) => {
  try {
    const response = await ClassModel.create(req.body);
    const { _id, teacherId } = response;
    const userResponse = await UserModel.updateOne(
      { _id: teacherId },
      { $addToSet: { classes: [_id] } }
    );

    res.send({ status: "success", response, userResponse });
  } catch (error) {
    res.send({ status: "error", error });
  }
});

export default router;
