import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

export const Quiz = sequelize.define('Quiz', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  quiz_name: { type: DataTypes.STRING(255), allowNull: false },
  quiz_type: { type: DataTypes.STRING(50), allowNull: false }, // 'personal' or 'host'
  host_user_id: { type: DataTypes.UUID, references: { model: 'users', key: 'id' } },
  description: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING(50), defaultValue: 'upcoming' }, // 'upcoming', 'active', 'finished'
}, {
  timestamps: true,
  underscored: true,
});

User.hasMany(Quiz, { foreignKey: 'host_user_id' });
Quiz.belongsTo(User, { foreignKey: 'host_user_id' });

export default Quiz;
