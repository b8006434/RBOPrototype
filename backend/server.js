//#region All 'Require' statements to use in the server
var express = require("express");
var app = express();
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var multer = require('multer'),
  bodyParser = require('body-parser'),
  path = require('path');
var mongoose = require("mongoose");
mongoose.connect("mongodb+srv://root:manager123@cluster0.18vwf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority");
var fs = require('fs');
var requestTicket = require("./model/ticket.js");
var user = require("./model/user.js");
var dir = './uploads';
const sessionStorage = require('node-sessionstorage');
//#endregion

var upload = multer({
  storage: multer.diskStorage({

    destination: function (req, file, callback) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      callback(null, './uploads');
    },
    filename: function (req, file, callback) { callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); }

  }),

  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname)
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
      return callback(/*res.end('Only images are allowed')*/ null, false)
    }
    callback(null, true)
  }
});

//Setup application with the CORS middleware and use json formating
app.use(cors());
app.use(express.static('uploads'));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: false
}));

//Authorize the jwt token when calling an API
app.use("/", (req, res, next) => {
  try {
    if (req.path == "/login" || req.path == "/register" || req.path == "/") {
      next();
    } else {
      /* decode jwt token if authorized*/
      jwt.verify(req.headers.token, 'shhhhh11111', function (err, decoded) {
        if (decoded && decoded.user) {
          req.user = decoded;
          next();
        } else {
          return res.status(401).json({
            errorMessage: 'User unauthorized!',
            status: false
          });
        }
      })
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
})

//Set the APIs up
app.get("/", (req, res) => {
  res.status(200).json({
    status: true,
    title: 'Apis'
  });
});


//#region POST APIs

//Login API to let the user log into the main application
//URL: http://localhost:2000/login
app.post("/login", (req, res) => {
  try {
    //Make sure the required parameters have been received from the request
    if (req.body && req.body.username && req.body.password) {
      //Find the user in DB by the provided username
      user.find({ username: req.body.username }, (err, data) => {
        //If user was found, set the token and login details in storage
        if (data.length > 0) {
          if (bcrypt.compareSync(data[0].password, req.body.password)) {
            checkUserAndGenerateToken(data[0], req, res,data[0].type);
            sessionStorage.setItem('user',req.body.username);
            sessionStorage.setItem('secret',req.body.password);
            sessionStorage.setItem('userType',data[0].type);
            //User not found, so return an error message
          } else {
            res.status(400).json({
              errorMessage: 'Username or password is incorrect!',
              status: false
            });
          }
          //User not found, so return an error message
        } else {
          res.status(400).json({
            errorMessage: 'Username or password is incorrect!',
            status: false
          });
        }
      })
    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }

});

//Register API, this adds the user to the DB
//URL: http://localhost:2000/register
app.post("/register", (req, res) => {
  try {
    //Make sure the required parameters were passed in the request
    if (req.body && req.body.username && req.body.password && req.body.type) {
      //Check if the user already exists
      user.find({ username: req.body.username }, (err, data) => {
        //User doesn't exist, so create a new one
        if (data.length == 0) {
          let User = new user({
            username: req.body.username,
            password: req.body.password,
            type : req.body.type
          });
          //Register the user for the chat function as a client
          registerUserForChat(req.body.username,req.body.password);
          //Save the user in the database
          User.save((err, data) => {
            //Save has failed, so return with an error message
            if (err) {
              res.status(400).json({
                errorMessage: err,
                status: false
              });
              //Save succesfull, so return a success message
            } else {
              res.status(200).json({
                status: true,
                title: 'Registered Successfully.',
                userID: User._id
              });
            }
          });
          //User already exists, so return an error message
        } else {
          res.status(400).json({
            errorMessage: `UserName ${req.body.username} Already Exist!`,
            status: false
          });
        }
      });
      //Incorrect parameters passed, so return an error message
    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
    //Catch any error in the code above, and return an error message
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

//API to allow users to request a new item
//URL: http://localhost:2000/add-ticket
app.post("/add-ticket", upload.any(), (req, res) => {
  try {
    //Make sure the required parameters are being passed in & that the user requesting this is a client user
    if (req.body && req.body.itemName && sessionStorage.getItem('userType') == 'Client') {
      //Set up the variable that contains the ticket ID of the latests added item in the DB
       var lastID = -1;
       //Find the latest added item in the DB
       ticket.find({}).sort({_id: -1}).limit(1).then((products) => {
        //When the latest added item is retrieved, create a new request, set the fields and increase the ticket number ID by 1
        lastID = products[0].ticketNumber + 1;
        let new_ticket= new requestTicket();
        new_ticket.ticketNumber = lastID;
        new_ticket.client = sessionStorage.getItem('user');
        new_ticket.itemName = req.body.itemName;
        new_ticket.ticketDate = Date.now();
        new_ticket.state = "Created";
        new_ticket.stateChangeUser = clientString;
        new_ticket.stateChangeDate = Date.now();
        
        //Save the newly created ticket in the DB
        new_ticket.save((err, data) => {
          //If the save failed, return an error message
          if (err) {
            res.status(400).json({
              errorMessage: err,
              status: false
            });
            //Save was succesfull, so return a success message
          } else {
            res.status(200).json({
              status: true,
              title: 'Ticket Added successfully.',
              ticketID: new_ticket._id
            });
          }
        });
    })
    //Incorrect paramters were added, so return an error message
    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
    //Catch any errors from above code, and return an error message
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

//API to update a valid user in the DB
//URL: http://localhost:2000/update-user
app.post("/update-user",upload.any(), (req, res) => {
  try {
    //Check that the required parameters were added to the request
    if(req.body && req.body.username && req.body.type)
    {
      //Find the user by the USER ID passed in the request
      user.findById(req.body.id, (err, foundUser) => {
        //Set the passed parameters, which are user name and the user type for this user
        foundUser.username = req.body.username;
        foundUser.type = req.body.type;

        //Save the user in the DB, which saves the updated fields
        foundUser.save((err, data) => {
          //If the save failed, send an error response with the error message
          if (err) {
            res.status(400).json({
              errorMessage: err,
              status: false
            });
            ///Save was succesfull, so send success response and a message
          } else {
            res.status(200).json({
              status: true,
              title: 'Ticket updated.'
            });
          }
        });

      });
    }
    //The parameters in the request do not match with what we require, so return error
    else
    {
      res.status(400).json({
        errorMessage: 'Incorrect parameters passed!',
        status: false
      }); 
    }
  }
  //Handle any error in the try block above, and return an error message
  catch(e)
  {
    console.log(e.message);
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });  
  }
});

//API to update a requested item
//URL: http://localhost:2000/update-ticket
app.post("/update-ticket", upload.any(), (req, res) => {
  try {
    //Check, that the required paramters are passed in the request, and the user is a client
    if (req.files && req.body && sessionStorage.getItem('userType') == 'Client') 
    {
      //Find the request in DB by matching the request ID in the DB
      requestTicket.findById(req.body.id, (err, new_ticket) => {
        //Set the requested item name and the state change date to current date/time
        new_ticket.itemName = req.body.itemName;
        new_ticket.stateChangeDate = Date.now();

        //Determine, whether the requested item's state needs to be changed
        if(new_ticket.state == 'User To Review')
        {
          new_ticket.state = 'User Reviewed';
        }
        //Save the ticket, which updates the fields changed
        new_ticket.save((err, data) => {
          //If the save fails, return an error message
          if (err) {
            res.status(400).json({
              errorMessage: err,
              status: false
            });
            //Otherwise save was succesfull, so return a success message
          } else {
            res.status(200).json({
              status: true,
              title: 'Ticket updated.'
            });
          }
        });
      });
    //Either the required parameters are incorrect, or the user requesting the change is not a client,
    //Therefore, check that the parameters needed are correct and the user is an employee
    }
    else if(req.files && req.body && sessionStorage.getItem('userType') == 'Employee')
    {
      //Find the requested item by the ID in the DB
      requestTicket.findById(req.body.id, (err, new_ticket) => {
        //Set the employee assigned either from the request or the currently logged in user
        new_ticket.employee = req.body.employee == 'selectFromDb' ? sessionStorage.getItem('user') : req.body.employee;
        //Set the state, cost and maximum cost allowed fields for the request
        new_ticket.stateChangeDate = Date.now();
        new_ticket.state = req.body.state;
        new_ticket.stateChangeUser = req.body.employee;
        new_ticket.cost = req.body.cost;
        new_ticket.maxCost = req.body.allowedCost ?? 0;

        //Save the updated request in the DB
        new_ticket.save((err, data) => {
          //If the save failed, return an error message 
          if (err) {
            res.status(400).json({
              errorMessage: err,
              status: false
            });
            //Save was succesfull, so return a success message
          } else {
            res.status(200).json({
              status: true,
              title: 'Ticket updated.'
            });
          }
        });
      });
    }
    //Either the required parameters are incorrect, or the user requesting the change is not an employee,
    //Therefore, check that the parameters needed are correct and the user is an admin
    else if(req.body && sessionStorage.getItem('userType') == 'Admin')
    {
      //Find the requested item by the ID passed in the request
      requestTicket.findById(req.body.id, (err, new_ticket) => {
        //Update the status fields
        new_ticket.stateChangeDate = Date.now();
        new_ticket.state = req.body.state;

        //Save the updated ticket into the DB
        new_ticket.save((err, data) => {
          //If save failed return an error message
          if (err) {
            res.status(400).json({
              errorMessage: err,
              status: false
            });
            //Else the save was completed, so return a success message
          } else {
            res.status(200).json({
              status: true,
              title: 'Ticket updated.'
            });
          }
        });
      });
    //Incorrect paramters were passed in the request, or the user type is not correct, so return an error message
    }
    else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  //Handle the caught exception, and return an error message
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

//API to delete a given request by the request ID
//URL: http://localhost:2000/delete-ticket
app.post("/delete-ticket", (req, res) => {
  try {
    //Make sure that the required parameters are passed in the request, and the user type is not an employee,
    //as employees are not allowed to delete a ticket request
    if (req.body && req.body.id && sessionStorage.getItem('userType') != 'Employee' ) {
        //Delete a record in DB, that matches the ID field passed in the request
        requestTicket.deleteOne({ _id: req.body.id}, function (err) {
          //If the deletion failed, return an error message
          if (err)
          {
            res.status(400).json({
              errorMessage: 'Failed to delete!',
              status: false
            });
          }
          //Otherwise, return a success message
          else
          {
            res.status(200).json({
              errorMessage: 'Deleted record!',
              status: false
            });
          }
        });
      }
      //Incorrect parameters in the request, or the user trying to delete the record is an employee type,
      //so return an error message
      else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
    //Handle the error from the try block above, and return an error message
  } catch (e) {
    console.log(e.message);
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

//API to delete a given user by the user ID
//URL: http://localhost:2000/delete-user
app.post("/delete-user", (req, res) => {
  try {
    //Make sure that the required parameters are passed in the request, and the user requesting the deletion,
    //is an admin user type
    if (req.body && req.body.id && sessionStorage.getItem('userType') == 'Admin' ) {
      //Delete the given user from the DB by matching the ID field passed in from the request
        user.deleteOne({ _id: req.body.id}, function (err) {
          //If the deletion failed, return an error message
          if (err)
          {
            res.status(400).json({
              errorMessage: 'Failed to delete!',
              status: false
            });
          }
          //Otherwise, return a success message
          else
          {
            res.status(200).json({
              errorMessage: 'Deleted record!',
              status: false
            });
          }
        });
      }
      //Incorrect paramters in the request, or the user is not an admin, therefore return an error message
      else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
    //Handle any error from the try block above, and return an error message
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

//#endregion

//#region GET APIs

//API that returns all requested items based on the user that created the request
//The username is retrieved from the currently logged in user for a client user
//URL: http://localhost:2000/get-ticket
app.get("/get-ticket", (req, res) => {
  try {
    //If the user requesting the tickets is a client, return the requestes created by this user
    if(sessionStorage.getItem('userType') == 'Client')
    {
    //Get the username of the currently logged in user
    var userName = sessionStorage.getItem('user');
    //Find all requested items based on the username field matched from the currently logged in user
    requestTicket.find({ client:userName  })
      .then((data) => {
            //If tickets were retrieved, return them in the response
            if (data && data.length > 0) {
              res.status(200).json({
                status: true,
                title: 'Tickets retrived.',
                tickets: data
              });
            //No tickets were found, so return an error message
            } else {
              res.status(400).json({
                errorMessage: 'There is no tickets!',
                status: false
              });
            }
      //Handle any errors returned in the find promise
      }).catch(err => {
        console.log(err),
        res.status(400).json({
          errorMessage: err.message || err,
          status: false
        });
      });
    }
    //The user requesting the tickets is not a client, so check if the user is an employee
    //If the user is an employee, return the tickets that need allocating(queue tickets)
    else if(sessionStorage.getItem('userType') == 'Employee')
    {
      //Find all the tickets, where the employee field is not filled in, or user reviewed tickets in the DB
      requestTicket.find({"$or":[{employee:{$exists:false}},{state:"User Reviewed"}]})
        .then((data) => {
              //If tickets were found, return them in a success response
              if (data && data.length > 0) {
                res.status(200).json({
                  status: true,
                  title: 'Tickets retrived.',
                  tickets: data
                });
                //Else no tickets were found, so return an error message
              } else {
                res.status(400).json({
                  errorMessage: 'There is no tickets!',
                  status: false
                });
              }
        //Handle any errors returned in the find promise
        }).catch(err => {
          console.log(err),
          res.status(400).json({
            errorMessage: err.message || err,
            status: false
          });
        });
    }
    //If the user requesting these tickets is not a client or an employee,
    //check whether the user is an admin and return all the tickets, where a further review by an admin is required
    else if(sessionStorage.getItem('userType') == 'Admin')
    {
      //Find all the tickets in the DB, where the state is set as 'Further Review Required'
      requestTicket.find({ state: 'Further Review Required'})
        .then((data) => {
              //If there are tickets found, return them in a success response
              if (data && data.length > 0) {
                res.status(200).json({
                  status: true,
                  title: 'Tickets retrived.',
                  tickets: data
                });
                //Else there are no tickets retrieved, so return an error message
              } else {
                res.status(400).json({
                  errorMessage: 'There is no tickets!',
                  status: false
                });
              }
        //Catch any errors returned by the find promise, and return an error message
        }).catch(err => {
          console.log(err),
          res.status(400).json({
            errorMessage: err.message || err,
            status: false
          });
        });
    }
    //Catch and handle any exceptions thrown in the try block above, return an error message
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }

});

//API that returns all requested items allocated to an employee
//The username is retrieved from the currently logged in user for an employee user
//URL: http://localhost:2000/get-mytickets
app.get("/get-mytickets", (req, res) => {
  try {
    //Make sure, that the currently logged in user is an employee user
    if(sessionStorage.getItem('userType') == 'Employee')
    {
    //Retrieve the currently logged in user name from the session storage
    var userName = sessionStorage.getItem('user');
    //Find all the requested items, that were assigned to this employee based on the employee field
    requestTicket.find({ employee:userName  })
      .then((data) => {
            //If the tickets were found, return them in a success response
            if (data) {
              res.status(200).json({
                status: true,
                title: 'Tickets retrived.',
                tickets: data,
              });
            //Else no tickets were found, so return an error message
            } else {
              res.status(400).json({
                errorMessage: 'There is no tickets!',
                status: false
              });
            }
      //Handle any errors thrown in the find promise returned
      }).catch(err => {
        console.log(err),
        res.status(400).json({
          errorMessage: err.message || err,
          status: false
        });
      });
    }
  //Catch and handle any exceptions thrown in the main try block above, return an error message
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }

});

//API that returns all users in the DB
//URL: http://localhost:2000/get-users
app.get("/get-users", (req, res) => {
  try {
    //Retrieve all users, and return them in a success response if found,
    //Otherwise return an error message, as no users found in the DB
    user.find().then((data) => {
            if (data) {
              res.status(200).json({
                status: true,
                title: 'Users retrived.',
                users: data,
              });
            } else {
              res.status(400).json({
                errorMessage: 'There is no users!',
                status: false
              });
            }
      //Catch and handle any errors thrown in the find promise returned
      }).catch(err => {
        console.log(err),
        res.status(400).json({
          errorMessage: err.message || err,
          status: false
        });
      });
  //Catch and handle any exceptions thrown in the main try block
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }

});

//API that returns users matched with a passed searched text
//URL: http://localhost:2000/search-users
app.get("/search-users", (req, res) => {
  try {

    //If the search term passed in the request is incorrect, return an error message
    if(!req.query.search || req.query.search == '')
    {
      res.status(400).json({
        errorMessage: 'Incorrect search term!',
        status: false
      });
      return;
    }

    //Create the query - Search indicates that this is a search query,
                       //Index is the search index on which collection to search
                       //Text is what we are searching for
                       //Query is the search term used passed in the request
    const agg = [
      {
        '$search': {
          'index': 'users_search_index',
          'text': {
            'query': req.query.search,
            'path': {
              'wildcard': '*'
            }
          }
        } 
      }
    ];
    //Run the aggregate query created above, that searches the users collection with the given search term passed in the request
    //This searches all fields set in the index - currently all fields
    user.aggregate(agg).then((data) => {
            if (data) {
              //If users were matched, return them in a success message
              res.status(200).json({
                status: true,
                title: 'Users retrived.',
                users: data,
              });
              //Else no users were matched, so return an error message
            } else {
              res.status(400).json({
                errorMessage: 'There is no users!',
                status: false
              });
            }
      //Catch and handle any errors thrown in the aggregate promise returned
      }).catch(err => {
        console.log(err),
        res.status(400).json({
          errorMessage: err.message || err,
          status: false
        });
      });
  //Catch and handle any exceptions thrown by the main try block
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }

});

//API that returns requestes matched with a passed searched text
//URL: http://localhost:2000/search-tickets
app.get("/search-tickets", (req, res) => {
  try {
    //If the search term passed in the request is incorrect, return an error message
    if(!req.query.search || req.query.search == '')
      {
         res.status(400).json({
         errorMessage: 'Incorrect search term!',
         status: false
        });
        return;
      }

    //Create the query - Search indicates that this is a search query,
                       //Index is the search index on which collection to search
                       //Text is what we are searching for
                       //Query is the search term used passed in the request
    const agg = [
      {
        '$search': {
          'index': 'default',
          'text': {
            'query': req.query.search,
            'path': {
              'wildcard': '*'
            }
          }
        } 
      }
    ];

    //Run the aggregate query created above, that searches the tickets collection with the given search term passed in the request
    //This searches all fields set in the created index - currently all fields
    requestTicket.aggregate(agg).then((data) => {
            //If tickets were matched with the search, return them in a success message
            if (data) {
              res.status(200).json({
                status: true,
                title: 'Tickets retrived.',
                tickets: data,
              });
            //Else no tickets found, so return an error message
            } else {
              res.status(400).json({
                errorMessage: 'There is no tickets!',
                status: false
              });
            }
      //Catch and handle any errors thrown in the aggregate promise returned
      }).catch(err => {
        console.log(err),
        res.status(400).json({
          errorMessage: err.message || err,
          status: false
        });
      });
  //Catch and handle any exceptions thrown in the main try block above, return an error message
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }

});


//#endregion

//#region Methods

//Register a client user the for the chat function
function registerUserForChat(username, password){
 
  var axios = require('axios');

  //Set the body for the API call, which sets the client username and password
  var data = {
    "username": username,
    "secret": password
  };
  
  //Create the API call configuration, which sets the private key used for the chat
  var config = {
    method: 'post',
    url: 'https://api.chatengine.io/users/',
    headers: {
      'PRIVATE-KEY': '{{86158205-d64c-40e7-8eb1-955c7689ad7c}}'
    },
    data : data
  };
  
  //Run the API call configured above
  axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })
  //Catch any unhandled exceptions thrown by the promise
  .catch(function (error) {
    console.log(error);
  });
}

//Function to check, that the user is valid, and generate a application-wide token for them for auth
function checkUserAndGenerateToken(data, req, res, type) {
  //Try login in the jwt and generate a jwt token
  jwt.sign({ user: data.username, id: data._id }, 'shhhhh11111', { expiresIn: '1d' }, (err, token) => {
    //If the login failed, return an error message
    if (err) {
      res.status(400).json({
        status: false,
        errorMessage: err,
      });
    //Else the login succeeded, so return the token in the success message
    } else {
      clientString = req.body.username;
      res.json({
        message: 'Login Successfully.',
        token: token,
        status: true,
        type:type
      });
    }
  });
}

//#endregion

//Run the server on port 2000
app.listen(2000, () => {
  console.log("Server is Runing On port 2000");
});
