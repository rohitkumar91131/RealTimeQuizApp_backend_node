import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    question_text: { type: String, required: true },
    options: [{ type: String }], // array of options
    correct_answer: { type: String, required: true },
    time_limit: { type: Number, default: 30 },
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);
export default Question;
