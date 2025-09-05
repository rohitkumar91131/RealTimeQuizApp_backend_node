import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    selected_answer: { type: String },
    is_correct: { type: Boolean, default: false },
    time_taken: { type: Number }, // seconds
  },
  { timestamps: true }
);

const UserQuestionAttempt = mongoose.model("UserQuestionAttempt", attemptSchema);
export default UserQuestionAttempt;
