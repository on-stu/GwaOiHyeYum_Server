import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    quitReason: { type: String },
    quitAt: { type: Date },
  },
  {
    collection: "admin",
  }
);

const AdminModel = mongoose.model("AdminSchema", AdminSchema);

export default AdminModel;
