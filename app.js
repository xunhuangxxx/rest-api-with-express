'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const { sequelize, models, User, Course } = require('./models/index');
const bcrypt = require('bcrypt');
const auth = require('basic-auth');

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


//Create user authentication middleware

const userAuthentication = async (req, res, next) => {
  const credentials = auth(req);
  let message;
  if(credentials){
     const user = await User.findOne({where:{
       emailAddress: credentials.name,
     }});
     if(user){
          const authenticated = bcrypt.compareSync(credentials.pass, user.password);
          if(authenticated){
              req.currentUser = user;
          }else{
              message = "Password doesn't match the user";
          }
      }else{
         message = "User not found";
      }
  }else{
      message =  'Auth header not found';
  }

  if(message){
    console.error(message);
    res.status(401).json({ message: 'Access Denied' });
 }else{
     next();
 }    
}



// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});



// Route that get all the users' info
app.get('/api/users', userAuthentication, async(req, res)=> {
   res.json({
     firstName: req.currentUser.firstName,
     lastName: req.currentUser.lastName,
     emailAddress: req.currentUser.emailAddress
   });
   res.status(200);
}); 
  
// Route that create a new user
app.post('/api/users', async(req, res)=> {
   const user = req.body;
   
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
          console.log(errors);
          res.status(400).json({ errors });   
       } else {
          throw error;
       }
     } 
     res.end();  
    });
   
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
app.post('/api/courses', userAuthentication, async(req, res)=> {
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
app.put('/api/courses/:id', userAuthentication, async(req, res)=> {
  const courseId = req.params.id;
    try {
      const course = await Course.findByPk(courseId);
      if(course.userId===req.currentUser.id){
          await course.update({
            title: req.body.title,
            description: req.body.description,
            estimatedTime: req.body.estimatedTime,
            materialsNeeded: req.body.materialsNeeded,
            userId: req.body.userId    
          });
           res.status(204);   
      }else{
        res.status(403).json({
          message: 'Course can not be updated',
        });;
      }
    }
    catch (error) {
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

// Route that delete the corresponding course
app.delete('/api/courses/:id', userAuthentication, async(req, res)=> {
  const courseId = req.params.id;
  const course = await Course.findByPk(courseId);
  if(course.userId===req.currentUser.id){
    course.destroy();
    res.status(204);
  }else{
    res.status(403).json({
      message: 'Course can not be deleted',
    });;   
  }

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


