import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nickname: { type: String, required: true },
    socialLogin: { type: String },
    usertype: { type: String },
    following: { type: Array },
    follower: { type: Array },
    classes: { type: Array },
    schedules: { type: Array },
    photoURL: { type: String },
    myQuizes: { type: Array },
    selfIntroduction: { type: String, default: "" },
  },
  {
    collection: "users",
  }
);

const UserModel = mongoose.model("UserSchema", UserSchema);

export default UserModel;
