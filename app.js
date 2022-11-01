'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const { sequelize, models, User, Course } = require('./models/index');

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

   const newUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      emailAddress: req.body.emailAddress,
      password: req.body.password
   });
   res.location('/');
   res.status(201);
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
  res.json({
     title: course.title,
     description: course.description,
     estimatedTime: course.estimatedTime,
     materialsNeeded: course.materialsNeeded
  });

  res.status(200);
}); 

// Route that create a new course
app.post('/api/courses', async(req, res)=> {

  const newCourse = await Course.create({
    title: req.body.title,
    description: req.body.description,
    estimatedTime: req.body.estimatedTime,
    materialsNeeded: req.body.materialsNeeded,
    userId: req.body.userId    
  });
  res.location(`/api/courses/${newCourse.id}`);
  res.status(204);
  res.end();
}); 

// Route that update the corresponding course
app.put('/api/courses/:id', async(req, res)=> {
  const courseId = req.params.id;
  const course = await Course.findByPk(courseId);
  course.update({
    title: req.body.title,
    description: req.body.description,
    estimatedTime: req.body.estimatedTime,
    materialsNeeded: req.body.materialsNeeded,
    userId: req.body.userId    
  });
  res.status(204);
  res.end();
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


