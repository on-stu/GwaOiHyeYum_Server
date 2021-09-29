import mongoose from "mongoose";

const ClassSchema = new mongoose.Schema(
  {
    teacherId: { type: String, required: true },
    teacherNickname: { type: String, required: true },
    students: { type: Array },
    classTitle: { type: String, required: true },
    subjectName: { type: String, required: true },
    assignments: { type: Array },
    displayIcon: { type: String },
    iconColor: { type: String },
  },
  {
    collection: "classes",
  }
);

const ClassModel = mongoose.model("ClassSchema", ClassSchema);

export default ClassModel;
