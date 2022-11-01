const { Model, Sequelize, DataTypes} = require('sequelize');

module.exports = (sequelize) => {

   class User extends Model{}
   User.init({
     id: {
         type: Sequelize.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },

     firstName:{
        type: DataTypes.STRING,
     },
     lastName:{
        type: DataTypes.STRING,
     },
     emailAddress:{
        type: DataTypes.STRING,
     },
     password:{
        type: DataTypes.STRING,
     },

       
   }, {sequelize});
   //Define Model Associations
   User.associate = (models) => {
     User.hasMany(models.Course, {
      foreignKey: 'userId',
     });
   };  
   
   return User;
}