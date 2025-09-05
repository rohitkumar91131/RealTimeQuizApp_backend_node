
import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";
import User from "../models/User.js";

export default function quizSocketEvennts(io, socket ) {
  socket.on("create_a_quiz", async (data) => {
    try {
      const { type, no_of_questions, quiz_name } = data;
      console.log(data)

      if (!type || !no_of_questions ) {
        socket.emit("create_quiz_error", "Missing required fields");
        return;
      }

      // Check if user exists
      const user = await User.findByPk(socket.user.id);
      if (!user) {
        socket.emit("create_quiz_error", "Host user not found");
        return;
      }

      // Create the quiz
      const quiz = await Quiz.create({
        quiz_name: quiz_name || `${user.name}'s Quiz`,
        quiz_type: type,           // 'personal' or 'host'
        host_user_id: user.id,
        status: "upcoming",
      });

      // Pre-create empty questions
      const questions = [];
      for (let i = 0; i < no_of_questions; i++) {
        questions.push({
          quiz_id: quiz.id,
          question_text: "",
          options: [],          // can store as JSON
          correct_answer: "",
        });
      }
      await Question.bulkCreate(questions);

      // Emit success to the host
      socket.emit("quiz_created", {
        quizId: quiz.id,
        quiz_name: quiz.quiz_name,
        no_of_questions,
      });

      console.log(`Quiz ${quiz.id} created by ${user.name}`);
    } catch (err) {
      console.error(err);
      socket.emit("quiz_error", "Failed to create quiz");
    }
  });
}
