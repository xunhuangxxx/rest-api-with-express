const { Model, Sequelize, DataTypes} = require('sequelize');

module.exports = (sequelize) => {

   class User extends Model{}
   User.init({

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
     }
       
   }, {sequelize});
   //Define Model Associations
   User.associate = (models) => {
     User.hasMany(models.Course);
   };  
   
   return User;
}