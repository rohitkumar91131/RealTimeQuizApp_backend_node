import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    quiz_name: { type: String, required: true },
    quiz_type: { type: String, enum: ["personal", "host"], required: true },
    host_user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    description: { type: String },
    status: { type: String, enum: ["upcoming", "active", "finished"], default: "upcoming" },
  },
  { timestamps: true }
);

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;
