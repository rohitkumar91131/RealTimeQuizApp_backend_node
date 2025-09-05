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

      if (!["personal","host"].includes(type)) {
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

      const user = await User.findByPk(socket.user.id);
      if (!user) {
        socket.emit("quiz_error", "Host user not found");
        return;
      }

      const quiz = await Quiz.create({
        quiz_name: quiz_name?.trim() || `${user.name}'s Quiz`,
        quiz_type: type,
        host_user_id: user.id,
        status: "upcoming",
      });

      const questions = Array.from({ length: Number(no_of_questions) }).map(() => ({
        quiz_id: quiz.id,
        question_text: "",
        options: [],
        correct_answer: "",
      }));

      if (questions.length > 0) {
        await Question.bulkCreate(questions);
      }

      socket.emit("quiz_created", {
        quizId: quiz.id,
        quiz_name: quiz.quiz_name,
        no_of_questions: questions.length,
      });

      const broadcastData = {
        id: quiz.id,
        quiz_name: quiz.quiz_name,
        quiz_type: quiz.quiz_type,
        status: quiz.status,
        host: { id: user.id, name: user.name, username: user.username },
        createdAt: quiz.createdAt
      };
      
      if (isPrivate) {
        socket.emit("private_quiz", broadcastData);
      } else {
        io.emit("public_quiz", broadcastData);
      }

      console.log(`Quiz ${quiz.id} created by ${user.name}`);

    } catch (err) {
      console.error("Quiz creation error:", err.message);
      socket.emit("quiz_error", "Failed to create quiz");
    }
  });

  socket.on("get_all_quizzes", async () => {
    try {
      const quizzes = await Quiz.findAll({
        include: [{ model: User, attributes: ["id", "name", "username"] }],
        order: [["createdAt", "DESC"]],
      });

      const quizzesData = quizzes.map(quiz => ({
        id: quiz.id,
        quiz_name: quiz.quiz_name,
        quiz_type: quiz.quiz_type,
        status: quiz.status,
        host: quiz.User ? { id: quiz.User.id, name: quiz.User.name, username: quiz.User.username } : null,
        createdAt: quiz.createdAt,
      }));

      socket.emit("all_quizzes", quizzesData);

    } catch (err) {
      console.error("Fetching quizzes error:", err.message);
      socket.emit("quiz_error", "Failed to fetch quizzes");
    }
  });
}
