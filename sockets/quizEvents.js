import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";
import User from "../models/User.js";

export default function QuizHandler(io, socket) {
  socket.on("create_a_quiz", async (data) => {
    try {
      const { type, no_of_questions, name: quiz_name, isPrivate } = data;

      if (!type || !no_of_questions) {
        socket.emit("quiz_error", "Missing required fields");
        return;
      }

      if (!["personal", "host"].includes(type)) {
        socket.emit("quiz_error", "Invalid quiz type");
        return;
      }

      if (Number(no_of_questions) < 1 || Number(no_of_questions) > 10) {
        socket.emit("quiz_error", "Number of questions must be 1-10");
        return;
      }

      if (!socket.user?.id) {
        socket.emit("quiz_error", "User not authenticated");
        return;
      }

      const user = await User.findById(socket.user.id);
      if (!user) {
        socket.emit("quiz_error", "Host user not found");
        return;
      }

      // ✅ fix: schema ke according host_user use kiya
      const quiz = await Quiz.create({
        quiz_name: quiz_name?.trim() || `${user.name}'s Quiz`,
        quiz_type: type,
        host_user: user._id,
        status: "upcoming",
      });

      // ❌ Pehle yaha empty questions create ho rahe the (error)
      // ✅ Ab sirf quiz banega, questions alag se add honge

      socket.emit("quiz_created", {
        quizId: quiz._id,
        quiz_name: quiz.quiz_name,
        no_of_questions: Number(no_of_questions),
      });

      const broadcastData = {
        id: quiz._id,
        quiz_name: quiz.quiz_name,
        quiz_type: quiz.quiz_type,
        status: quiz.status,
        host: { id: user._id, name: user.name, username: user.username },
        createdAt: quiz.createdAt,
      };

      if (isPrivate) {
        socket.emit("private_quiz", broadcastData);
      } else {
        io.emit("public_quiz", broadcastData);
      }

      console.log(`Quiz ${quiz._id} created by ${user.name}`);
    } catch (err) {
      console.error("Quiz creation error:", err.message);
      socket.emit("quiz_error", "Failed to create quiz");
    }
  });

  // ✅ New event: Add question after quiz is created
  socket.on("add_question", async (data) => {
    try {
      const { quizId, question_text, options, correct_answer } = data;

      if (!quizId || !question_text || !correct_answer) {
        socket.emit("quiz_error", "Missing required question fields");
        return;
      }

      const question = await Question.create({
        quiz: quizId, // schema ke according quiz field
        question_text,
        options,
        correct_answer,
      });

      socket.emit("question_added", question);
    } catch (err) {
      console.error("Add question error:", err.message);
      socket.emit("quiz_error", "Failed to add question");
    }
  });

  socket.on("get_all_quizzes", async () => {
    try {
      const quizzes = await Quiz.find()
        .populate("host_user", "id name username")
        .sort({ createdAt: -1 });

      const quizzesData = quizzes.map((quiz) => ({
        id: quiz._id,
        quiz_name: quiz.quiz_name,
        quiz_type: quiz.quiz_type,
        status: quiz.status,
        host: quiz.host_user
          ? {
              id: quiz.host_user._id,
              name: quiz.host_user.name,
              username: quiz.host_user.username,
            }
          : null,
        createdAt: quiz.createdAt,
      }));

      socket.emit("all_quizzes", quizzesData);
    } catch (err) {
      console.error("Fetching quizzes error:", err.message);
      socket.emit("quiz_error", "Failed to fetch quizzes");
    }
  });
}
