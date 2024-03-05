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
  username: { type: String, required: true },
  log: { type: Array }
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


const exerciseSchema = Schema({
  username: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: String }

})

const Exercise = mongoose.model("exercises", exerciseSchema)


app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    let req_body = req.body;
    let newExercise = new Exercise(req_body);

    const currentDate = new Date();
    const options = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    const formattedCurretDate = currentDate.toDateString('en-US', options);

    if (newExercise.date == null || newExercise.date == '') {
      newExercise.date = formattedCurretDate
    } else {
      try {
        let submittedDate = new Date(req_body.date);
        const formattedSubmittedDate = submittedDate.toDateString('en-US', options);
        newExercise.date = formattedSubmittedDate
      } catch (error) {
        throw error;
      }
    }

    console.log("the Date: " + newExercise.date);
    console.log(newExercise);

    // find user using id
    let userId = req.params._id; // Assuming user ID is in the URL parameter
    console.log(")))))))))))))))))");
    console.log(userId);
    // findUserById
    let user = await findUserById(userId);
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    console.log(user);
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (!user.log) {
      user.log = [];
    }
    user.log.push(newExercise);

   

    await user.save();

    console.log("Exercise added to user log:", user.log);

    return res.json(user);
  } catch (error) {
    console.error("Error adding exercise:", error);
    return res.status(500).send("Internal Server Error");
  }
});

app.get('/api/users/:_id/logs', (req, res) => {
  const { from, to, limit } = req.query;
  console.log(from, to, limit);

  User.findById(req.params._id, (err, user) => {
    if (user) {
      let filteredLogs = user.log;
      
      if (from || to) {
        filteredLogs = filteredLogs.filter(log => {
          const logDate = new Date(log.date);
          return (!from || logDate >= new Date(from)) && (!to || logDate <= new Date(to));
        });
      }
      
      const count = filteredLogs.length;
      
      if (limit) {
        filteredLogs = filteredLogs.slice(0, limit);
      }
      
      user.log = filteredLogs;
      user.count = count;
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
});

 
app.get('/api/users/:_id/logs0', (req, res) => {
  const { from, to, limit } = req.query
  console.log(from, to, limit)

  
  User.findById(req.params._id, (err, user) => {
    if (user) {
      if (from || to || limit) {
        const logs = user.log
        const filteredLogs = logs
        .filter(log => {
          const formattedLogDate = (new Date(log.date)).toISOString().split('T')[0]
          return true
        }) 
        
      const slicedLogs = limit ? filteredLogs.slice(0, limit) : filteredLogs
      user.log = slicedLogs
      }
      res.json(user)
    }
  })
})

const createAndSaveExercise = async (exercise) => {
  console.log("I will try to save the exercise with the username provided")
  var newExercise = new User(exercise)
  try {
    const savedExercise = await newExercise.save()
    console.log('---------------------------------------------')
    console.log(savedExercise)
    console.log('---------------------------------------------')

    console.log("User Saved successfully ")
    console.log('---------------------------------------------')
    console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')

    return savedExercise;
  } catch (error) {
    throw error
  }


}

const findUserByIdz = async (userId) => {

  try {
    const userFound = await User.findById(userId).exec();
    // const userFound = await User.findById(userId).exec();


    return userFound;

  } catch (error) {
    throw error

  }
}

const findUserById = async (userId) => {
  try {
    const userFound = await User.findById(userId).exec();
    return userFound;
  } catch (error) {
    throw error;
  }
}



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
