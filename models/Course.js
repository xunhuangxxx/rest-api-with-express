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
      },
      description:{
          type: DataTypes.TEXT,
      },
      estimatedTime:{
          type: DataTypes.STRING,
      },
      materialsNeeded:{
          type: DataTypes.STRING,
      },
    //   userId:{
    //       type:DataTypes.STRING,
    //   }
    },  
    {sequelize});
   //Define Model Associations
   Course.associate = (models) => {
        Course.belongsTo(models.User, {
            foreignKey: 'userId',
        });
    };  
    return Course;
}

