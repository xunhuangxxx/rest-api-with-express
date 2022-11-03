const { Model, Sequelize, DataTypes} = require('sequelize');

module.exports = (sequelize) => {

   class Course extends Model{}
   Course.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      title:{
          type: DataTypes.STRING,
          allowNull:false,
          validate:{
            notNull:{
              msg:"A title is required"
            },
            notEmpty:{
              msg:"please provide a title"
            }
          }   
      },

      description:{
          type: DataTypes.TEXT,
          allowNull:false,
          validate:{
            notNull:{
              msg:"A description is required"
            },
            notEmpty:{
              msg:"please provide a description"
            }
          }   

      },

      estimatedTime:{
          type: DataTypes.STRING,
      },

      materialsNeeded:{
          type: DataTypes.STRING,
      },

    },  {sequelize});
   //Define Model Associations
   Course.associate = (models) => {
        Course.belongsTo(models.User, {
            foreignKey: 'userId',
        });
    };  
    return Course;
}

