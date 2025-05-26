const { DataTypes } = require('sequelize')
const bcrypt = require('bcrypt')

const sequelize = require('../lib/sequelize')

const User = sequelize.define('user', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  admin: { type: DataTypes.BOOLEAN, allowNull: false }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10)
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10)
      }
    }
  }
})

User.prototype.validatePassword = async function (password) {
  return bcrypt.compare(password, this.password)
}

exports.User = User
exports.UserClientFields = [
  'id',
  'name',
  'email',
  'password',
  'admin'
]
