const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');
var mongoose = require('mongoose')

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var mongodb_uri = process.env.MONGO_URI
console.log(mongodb_uri)
mongoose.connect(mongodb_uri, { useNewUrlParser: true, useUnifiedTopology: true })

// create mongodb schema
const Schema = mongoose.Schema;

const userSchema = Schema({
  username: { type: String, required: true }
})

const User = mongoose.model("users", userSchema)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post("/api/users", async (req, res) => {
  console.log(req.body.username);

  try {
    var submittedUsername = req.body.username
    var savedUser = await createAndSaveUser(submittedUsername)
    return res.json(savedUser)
  } catch (error) {
    throw error
  }

})

const createAndSaveUser = async (username) => {
  console.log("I will try to save the user with the username provice")
  var newUser = new User({ username: username })
  try {
    const savedUser = await newUser.save()
    console.log('---------------------------------------------')
    console.log(savedUser)
    console.log('---------------------------------------------')

    console.log("User Saved successfully ")
    console.log('---------------------------------------------')
    console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')

    return savedUser;
  } catch (error) {
    throw error
  }


}
app.get('/api/users', async (req, res) => {

  try {
    // const users = await User.find({}).select('-__v');
    const users = await User.find({});

    console.log(users);
    res.send(users)
  } catch (error) {
    console.error(error)
  }

})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
