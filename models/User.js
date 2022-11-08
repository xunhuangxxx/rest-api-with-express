const { Model, Sequelize, DataTypes} = require('sequelize');

module.exports = (sequelize) => {

   class User extends Model{}
   User.init({
     id: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },

     firstName:{
        type: DataTypes.STRING,
        allowNull:false,
        validate:{
         notNull:{
           msg:"A first name is required"
         },
         notEmpty:{
           msg:"please provide a first name"
         }
        }
     },

     lastName:{
        type: DataTypes.STRING,
        allowNull:false,
        validate:{
         notNull:{
           msg:"A last name is required"
         },
         notEmpty:{
           msg:"please provide a last name"
         }
        }
     },

     emailAddress:{
        type: DataTypes.STRING,
        allowNull:false,
        unique:{ 
         msg: "The email already exist"
        },
        validate:{
         notNull:{
           msg:"An email is required"
         },
         isEmail:{
           msg:"please provide a valid email"
         }
        }
     },

     password:{
        type: DataTypes.STRING,
        allowNull:false,
        validate:{
         notNull:{
           msg:"A password is required"
         },
         notEmpty:{  
           msg:"please provide a password"           
         }
        },
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