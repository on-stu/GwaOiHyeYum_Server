import express from "express";
import QuizModel from "../models/QuizModel.js";
import UserModel from "../models/UserModel.js";

const router = express.Router();

router.post("/makeQuiz", async (req, res) => {
  try {
    const quizItem = req.body;
    const { creatorId } = quizItem;

    const quizResponse = await QuizModel.create(quizItem);
    const userResopnse = await UserModel.updateOne(
      { _id: creatorId },
      {
        $addToSet: {
          myQuizes: [quizResponse._id],
        },
      }
    );
    res.send({ status: "success", quizResponse, userResopnse });
  } catch (error) {
    res.send({ status: "error", error: error });
  }
});

router.post("/getQuizes", async (req, res) => {
  try {
    const {
      body: { myQuizes },
    } = req;
    const myQ = await QuizModel.find({ _id: myQuizes }).lean();
    res.send({ status: "success", quizes: myQ });
  } catch (error) {
    res.send({ status: "error", error });
  }
});

router.post("/getQuiz", async (req, res) => {
  try {
    const {
      body: { id },
    } = req;
    const quiz = await QuizModel.find({ _id: id }).lean();
    res.send({ status: "success", quiz });
  } catch (error) {
    res.send({ status: "error", error });
  }
});

router.post("/removeQuiz", async (req, res) => {
  try {
    const {
      body: {
        quiz: { _id, addedTo },
      },
    } = req;
    const removeQuiz = await QuizModel.deleteOne({ _id });
    addedTo.map(async (userId) => {
      await UserModel.updateOne(
        { _id: userId },
        {
          $pull: { myQuizes: _id },
        }
      );
    });

    res.send({ status: "success", removeQuiz });
  } catch (error) {
    res.send({ status: "error", error });
  }
});

export default router;
