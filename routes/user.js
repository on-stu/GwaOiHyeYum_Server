import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";
import ClassModel from "../models/ClassModel.js";
import AdminModel from "../models/AdminModel.js";

const router = express.Router();

const JWT_SECRET = "adfiaoendddczzncjnasjd5if23348u%%^$ufnnjsbbshdfknc";

router.post("/login", async (req, res) => {
  const {
    body: { username, password },
  } = await req;
  const user = await UserModel.findOne({ username }).lean();

  if (!user) {
    return res.json({ status: "error", error: "아이디가 틀립니다." });
  }

  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET
    );
    return res.json({ status: "success", token: token });
  } else {
    return res.json({ status: "error", error: "비밀번호가 틀립니다." });
  }
});

router.post("/register", async (req, res) => {
  const {
    body: { username, password, nickname, usertype },
  } = await req;
  const hashedPassword = await bcrypt.hash(password, 10);

  if (typeof username !== "string") {
    return res.json({ status: "error", error: "사용할 수 없는 아이디" });
  }

  if (typeof password !== "string") {
    return res.json({ status: "error", error: "사용할 수 없는 비밀번호" });
  }

  if (username === "") {
    return res.json({ status: "error", error: "아이디를 입력해주세요" });
  }

  if (password.length < 6) {
    return res.json({
      status: "error",
      error: "비밀번호가 너무 짧습니다. 비밀번호는 최소 6자여야 합니다.",
    });
  }

  if (nickname === "") {
    return res.json({ status: "error", error: "닉네임을 입력해주세요" });
  }
  try {
    const response = await UserModel.create({
      username,
      password: hashedPassword,
      nickname,
      usertype,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.json({ status: "error", error: "아이디가 이미 사용중입니다" });
    }
  }
  res.send({ status: "success", username, password, nickname });
});

router.post("/getUserObj", async (req, res) => {
  const { token } = await req.body;
  try {
    const user = jwt.verify(token, JWT_SECRET);
    const userObj = await UserModel.findOne({ _id: user.id }).lean();
    res.send({ status: "success", user: userObj });
  } catch (error) {
    res.send({ status: "error", error });
  }
});

router.post("/getUserProfile", async (req, res) => {
  const {
    body: { id },
  } = req;

  try {
    const profile = await UserModel.find({ _id: id }).lean();
    res.send({ status: "success", profile: profile });
  } catch (error) {
    res.send({ status: "error", error });
  }
});

router.post("/kakaoLogin", async (req, res) => {
  const {
    body: { id, nickname, profile_image },
  } = req;

  const user = await UserModel.findOne({ username: id }).lean();
  if (!user) {
    const response = await UserModel.create({
      username: id,
      password: id,
      nickname,
      socialLogin: "kakao",
      usertype: "notyet",
      photoURL: profile_image,
    });
    const token = jwt.sign(
      {
        id: response._id,
        username: response.username,
      },
      JWT_SECRET
    );
    res.send({ status: "success", token: token });
  } else {
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      JWT_SECRET
    );
    res.send({ status: "success", token: token });
  }
});

router.post("/updateUser", async (req, res) => {
  const {
    body: { updatedUser },
  } = req;
  try {
    const response = await UserModel.updateOne(
      { _id: updatedUser._id },
      { $set: updatedUser }
    );
    res.send({ status: "success", data: response });
  } catch (error) {
    res.send({ status: "error", error });
  }
});

router.post("/changePassword", async (req, res) => {
  const { token, password, newpassword } = req.body;
  if (typeof newpassword !== "string") {
    return res.json({ status: "error", error: "사용할 수 없는 비밀번호" });
  }

  if (newpassword.length < 5) {
    return res.json({
      status: "error",
      error: "비밀번호가 너무 짧습니다. 비밀번호는 최소 6자여야 합니다.",
    });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    const _id = user.id;
    const userObj = await UserModel.findOne({ _id: user.id }).lean();
    if (await bcrypt.compare(password, userObj.password)) {
      const hashedPassword = await bcrypt.hash(newpassword, 10);

      await UserModel.updateOne(
        { _id },
        {
          $set: { password: hashedPassword },
        }
      );
      return res.send({ status: "success" });
    } else {
      res.send({ status: "error", error: "비밀번호가 틀립니다." });
    }
  } catch (error) {
    res.json({ status: "error", error });
    console.log(error);
  }
});

router.post("/deleteUser", async (req, res) => {
  const {
    body: { id, password, reason, quitAt },
  } = req;
  const user = await UserModel.findOne({ _id: id }).lean();
  if (
    (await bcrypt.compare(password, user.password)) ||
    user.socialLogin == "kakao"
  ) {
    if (user.usertype === "teacher") {
      user.classes.map(async (item) => {
        await ClassModel.updateOne(
          { _id: item },
          { $set: { teacherId: "Quit", teacherNickname: "탈퇴한 회원" } }
        );
      });
      await UserModel.deleteOne({ _id: id });
    } else {
      user.classes.map(async (item) => {
        await ClassModel.updateOne({ _id: item }, { $pull: { students: id } });
      });
      await UserModel.deleteOne({ _id: id });
    }
    user.follower.map(async (follow) => {
      await UserModel.updateOne(
        { _id: follow },
        {
          $pull: { following: id },
        }
      );
    });
    user.following.map(async (follow) => {
      await UserModel.updateOne(
        { _id: follow },
        {
          $pull: { follwer: id },
        }
      );
    });
    AdminModel.create({
      quitAt,
      quitReason: reason,
    });
    res.send({ status: "success" });
  } else {
    return res.json({ status: "error", error: "비밀번호가 틀립니다." });
  }
});

router.post("/followUser", async (req, res) => {
  const {
    body: { fromId, toId },
  } = req;
  try {
    await UserModel.updateOne(
      { _id: fromId },
      { $addToSet: { following: [toId] } }
    );
    await UserModel.updateOne(
      { _id: toId },
      { $addToSet: { follower: [fromId] } }
    );
    res.send({ status: "success" });
  } catch (error) {
    res.send({ status: "error", error });
  }
});

router.post("/followCancel", async (req, res) => {
  const {
    body: { fromId, toId },
  } = req;
  try {
    await UserModel.updateOne({ _id: fromId }, { $pull: { following: toId } });
    await UserModel.updateOne({ _id: toId }, { $pull: { follower: fromId } });
    res.send({ status: "success" });
  } catch (error) {
    res.send({ status: "error", error });
  }
});
router.post("/getUsers", async (req, res) => {
  const users = req.body;
  try {
    const result = await UserModel.find({ _id: users }).lean();
    res.send({ status: "success", users: result });
  } catch (error) {
    res.send({ status: "error", error });
  }
});

export default router;
