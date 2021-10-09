import express from "express";

const router = express.Router();

router.post("/init", (req, res) => {
  res.send("hello");
});

export default router;
