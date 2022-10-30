const { Model, Sequelize, DataTypes} = require('sequelize');

module.exports = (sequelize) => {

   class Course extends Model{}
   Course.init({

      title:{
          type: DataTypes.STRING,
      },
      description:{
          type: DataTypes.TEXT,
      },
      estimatedTime:{
          type: DataTypes.STRING,
      },
      materialNeeded:{
          type: DataTypes.STRING,
      },      
    },  
    {sequelize});
   //Define Model Associations
   Course.associate = (models) => {
     Course.belongsTo(models.User);
  };  
    return Course;
}

