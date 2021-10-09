import mongoose from "mongoose";

const QuizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    creatorId: { type: String, required: true },
    createdAt: { type: Date, required: true },
    likes: { type: Array },
    comments: { type: Array },
    addedTo: { type: Array },
    quiz: { type: Array, required: true },
    quizType: { type: String, required: true },
  },
  {
    collection: "quizes",
  }
);

const QuizModel = mongoose.model("QuizSchema", QuizSchema);

export default QuizModel;
