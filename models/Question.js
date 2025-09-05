import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Quiz from './Quiz.js';

export const Question = sequelize.define('Question', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  quiz_id: { type: DataTypes.UUID, references: { model: 'quizzes', key: 'id' }, onDelete: 'CASCADE' },
  question_text: { type: DataTypes.TEXT, allowNull: false },
  options: { type: DataTypes.JSONB },
  correct_answer: { type: DataTypes.STRING(255) },
  time_limit: { type: DataTypes.INTEGER, defaultValue: 30 },
}, {
  timestamps: true,
  underscored: true,
});

Quiz.hasMany(Question, { foreignKey: 'quiz_id', onDelete: 'CASCADE' });
Question.belongsTo(Quiz, { foreignKey: 'quiz_id' });

export default Question;
