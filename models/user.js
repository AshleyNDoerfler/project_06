const { DataTypes } = require('sequelize')
const bcrypt = require('bcrypt')

const sequelize = require('../lib/sequelize')

const User = sequelize.define('user', {
  id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false},
  password: { type: DataTypes.STRING, allowNull: false },
  admin: { type: DataTypes.BOOLEAN, allowNull: false}
})

exports.User = User
exports.UserClientFields = [
  'id',
  'name',
  'email',
  'password',
  'admin'
]