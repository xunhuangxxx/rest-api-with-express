'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const { sequelize, models, User, Course } = require('./models/index');
const bcrypt = require('bcrypt');

//test the database connection
console.log('Testing the connection to the database...');
(async() =>{
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();


// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// Setup request body JSON parsing.
app.use(express.json());

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// Route that get all the users' info
app.get('/api/users', async(req, res)=> {
  const users = await User.findAll();
  const allUsers = users.map(user => ({
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.emailAddress,
      password: user.password
   }));
 
   res.json(allUsers);
   res.status(200);
}); 

  
// Route that create a new user
app.post('/api/users', async(req, res)=> {
   const user = req.body;
   console.log(user);
   
   bcrypt.hash(user.password, 8, async function(err, hash) {
     try { 
        await User.create({
          firstName: user.firstName,
          lastName: user.lastName,
          emailAddress: user.emailAddress,
          password: hash
        });
        res.status(201);
        res.location('/'); 
      } catch (error) {
        console.log('ERROR: ', error.name);
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError'){
          const errors = error.errors.map(err => err.message);
          res.status(400).json({ errors });   
       } else {
          throw error;
       }
     }   
    });


   res.end();
}); 

// Route that get all the courses
app.get('/api/courses', async(req, res)=> {

  const courses = await Course.findAll();
  const allCourses = courses.map(course => ({
      title: course.title,
      description: course.description,
      estimatedTime: course.estimatedTime,
      materialsNeeded: course.materialsNeeded
  }));

  res.json(allCourses);
  res.status(200);
}); 

// Route that get the corresponding course
app.get('/api/courses/:id', async(req, res)=> {
  const courseId = req.params.id;
  const course = await Course.findByPk(courseId);
  res.json(course);
  res.status(200);
}); 

// Route that create a new course
app.post('/api/courses', async(req, res)=> {
  try{
    const newCourse = await Course.create(req.body);
    res.location(`/api/courses/${newCourse.id}`);
    res.status(204);  
  }catch(error){
    console.log('ERROR: ', error.name);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError'){
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else {
      throw error;
    }
  }
  res.end();
}); 

// Route that update the corresponding course
app.put('/api/courses/:id', async(req, res)=> {
  const courseId = req.params.id;
  try {
      const course = await Course.findByPk(courseId);
      await course.update({
        title: req.body.title,
        description: req.body.description,
        estimatedTime: req.body.estimatedTime,
        materialsNeeded: req.body.materialsNeeded,
        userId: req.body.userId    
      });
    res.status(204);   

  } catch (error) {
      console.log('ERROR: ', error.name);
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError'){
        const errors = error.errors.map(err => err.message);
        res.status(400).json({ errors });   
      } else {
        throw error;
      }    
  }
}); 

// Route that delete the corresponding course
app.delete('/api/courses/:id', async(req, res)=> {
  const courseId = req.params.id;
  const course = await Course.findByPk(courseId);
  course.destroy();
  res.status(204);
  res.end();
}); 










// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});


