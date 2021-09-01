const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const mongoose = require("mongoose");
const bodyParser = require("body-parser");

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;

const userModel = new Schema({
  username: { type: String, required: ture}
});

const exerciseSchema = new Schema({
  userId: { type: Schema.ObjectId, required: true },
  username: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: String
});

const userModel = mongoose.model('User', userSchema);
const exerciseModel = mongoose.model('Exercise', exerciseSchema);

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

app.post("/api/users", bodyParser.urlencoded({ extended: false }), function(req, res){
  let response = {};
  inputUsername = req.body['username'];

  console.log("INFO: Creating new user - " + inputUsername.toString());

  var newUser = new userModel({
    username: inputUsername
  });

  newUser.save(function(err, data){
    if(err){
      console.log("ERROR: Failed to create new user - " + inputUsername.toString());
      return console.log(err);
    }
    response['_id'] = data._id.toString();
    response['username'] = data.username.toString();
    
    console.log("INFO: New user created - " + inputUsername.toString());
    res.json(response);
  });
});

app.get("/api/users", function(req, res){
  userModel.find({}).select('_id username').exec(function(err, result){
    if(err) return console.log(err);
    res.json(result);
  });
});

app.post("/api/users/:_id/exercises", bodyParser.urlencoded({ extended: false }), function(req, res){
  let response = {};

  let inputId = req.params._id;
  let inputDesc = req.body['description'];
  let inputDuration = req.body['duration'];
  let inputDate = req.body['date'];

  if(inputDate == '' || inputDate == undefined) inputDate = new Date(Date.now()).toDateString();
  else inputDate = new Date(req.body['date']).toDateString();

  userModel.findById(inputId, function(err, result){
    if(err) return console.log(err);
    
    var newExercise = new exerciseModel({
      userId: inputId,
      username: result.username,
      description: inputDesc,
      duration: inputDuration,
      date: inputDate
    });

    response['_id'] = inputId;
    response['username'] = result.username;
    response['description'] = inputDesc;
    response['duration'] = parseInt(inputDuration);
    response['date'] = inputDate;

    newExercise.save(function(err, data){
      if(err){
        console.log("ERROR: Failed to create new exercise to user - " + inputId.toString());
        return console.log(err);
      }
      console.log("INFO: New exercise created for user id - " + inputId.toString());
    });
    res.json(response);
  });
});

app.get("/api/users/:_id/logs", function(req, res){
  let response = {};

  let inputId = req.params._id;

  userModel.findById(inputId, function(err, userResult){
    if(err) return console.log(err);

    let returnedUser = userResult.username;

    exerciseModel.find({ username: returnedUser }).select('description duration date').select({ _id: 0 }).exec(function(err, result){
      if(err) console.log(err);
      
      response['_id'] = inputId;
      response['username'] = returnedUser;
      response['count'] = result.length;
      response['log'] = result;

      res.json(response);
    });
  })
});