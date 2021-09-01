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

const userModel = mongoose.model('User', userSchema);

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