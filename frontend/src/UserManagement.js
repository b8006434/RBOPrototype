import React, { Component, useState } from 'react';
import {
  Button, TextField, Dialog, DialogActions, LinearProgress,
  DialogTitle, DialogContent, TableBody, Table,
  TableContainer, TableHead, TableRow, TableCell
} from '@material-ui/core';
import swal from 'sweetalert';
import ComboBox from 'react-responsive-combo-box'
import 'react-responsive-combo-box/dist/index.css'

const axios = require('axios');

//The default constructor for the UserManagement class
//This initializes the state for the class
export default class UserManagement extends Component {
  constructor() {
    super();
    this.state = {
      token: '',
      openProductModal: false,
      openProductEditModal: false,
      id: '',
      search: '',
      users: [],
      loading: false,
      username: '',
      password: '',
      type: ''
    };
  }

//This functions returns an array of possible 'user type' values
 ReturnUserTypeOptions = () => {
    return [
      'Client',
      'Employee',
      'Admin'
    ]
}

  //Verify that the logged in user is valid, when  this class is placed in the DOM
  //If the user token is not valid, redirect the user to the login page
  //Otherwise, set the token in the state and return all requests for the admin user  
  componentDidMount = () => {
    let token = localStorage.getItem('token');
    if (!token) {
      this.props.history.push('/login');
    } else {
      this.setState({ token: token }, () => {
        this.getUsers();
      });
    }
  }

  //Return all users on the system, independent of the user type
  //This calls the 'get-users' API
  getUsers = () => {
    
    this.setState({ loading: true });

    //Call the GET API to return all users on the system, passing the log in token in headers for API auth
    axios.get(`http://localhost:2000/get-users`, {
      headers: {
        'token': this.state.token
      }
    //If the users were returned, set the users in the class state
    }).then((res) => {
      this.setState({ loading: false, users: res.data.users});
    //Otherwise display an error to the user and set users to null
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
      this.setState({ loading: false, users: []},()=>{});
    });
  }

  //Delete an user, this calls the 'delete-user' API
  //ID field of the item to delete is passed in by the table, when the 'Delete' button is clicked
  deleteUser = (id) => {

    //Set the POST API request up, by passing in the ID of the userto be deleted,
    //pass in the log in token to authorize the API call
    axios.post('http://localhost:2000/delete-user', {
      id: id
    }, {
      headers: {
        'Content-Type': 'application/json',
        'token': this.state.token,
        'query': this.state.search
      }
    //If the deleteion was succesfull, update the list of users and return a success message to the user
    }).then((res) => {
      this.getUsers();
      swal({
        text: "Deleted User!",
        icon: "success",
        type: "success"
      });
    //Else handle any errors thrown by the API call promise, and show an error message to the user
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
    });
  }

  //When the user presses the log out button, set the token to null and re-direct them to the login/register page
  logOut = () => {
    localStorage.setItem('token', null);
    this.props.history.push('/');
  }

  //On data change, set the state of the field to the changed value
  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value }, () => { });
  };

  //Search the users table by the search bar, calling the 'search-users' API
  searchForItems = (e) =>{

    //Set the 'search' field in the state to the value passed in by the search component in the UI
    this.setState({ [e.target.name]: e.target.value }, () => { });
    
    //If the 'search' value is not valid, retrieve all tickets and return
    if(e.target.value == '' || e.target.value == ' ')
    {
      this.getUsers();
      return;
    }

    //Search value is valid, so run the API to search all users, where this search will be ran,
    //against all fields in the 'users' database, returning matching users
    axios.get(`http://localhost:2000/search-users`, {
      params: {
        search: e.target.value,
      },
      headers: {
        'token': this.state.token
      }
    //If users were returned, set the class state users to the returned value
    }).then((res) => {
      this.setState({ loading: false, users: res.data.users});
    //Otherwise display an error to the user and set the class users to null
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
      this.setState({ loading: false, users: []},()=>{});
    });
  }

  //Add a new user, calling the 'add-user' API
  addUser = () => {

      //If the typed in username or password are invalid, display a warning to the user   
      if(this.state.username == '' || this.state.password == '')
      {
          swal({
           text: "Please fill in username & password",
           icon: "warning",
           type: "warning"   
          });

          return;
      }
      //Otherwise, if the type is not in the 'ReturnUserTypeOptions' array, display a warning to the user
      else if(!this.ReturnUserTypeOptions().includes(this.state.type))
      {
          swal({
              text: "Please pick the user type out of the list",
              icon: "warning",
              type: "warning"
          });

          return;
      }

      
    //Call the POST API, passing in the username, password, user type in the request body,
    //and the token for API auth in the headers
    axios.post('http://localhost:2000/register', {
      username: this.state.username,
      password: this.state.password,
      type: this.state.type,
    //If the user was succefully added, show a success message to the user,
    //close the add user modal dialog, and reset the class state fields,
    //also, refresh the users table, as a new user has been added
    }).then((res) => {
      swal({
        text: res.data.title,
        icon: "success",
        type: "success"
      });
      this.getUsers();
      this.handleProductClose();
    //Handle any exceptions thrown by the API call returned promise, and show an error message to the user
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
    });
  }

  //Update the user,according to the given user ID, calling the 'update-user' API
  updateUser = () => {
    
    //If the username and type were not selected, show a warning message to the user
    if(this.state.username == '' && this.state.type == '')
      {
          swal({
              title: "No data to update!",
              icon: "error",
              type: "error"
          });
          return;
      }

    //Set up the ID, username, and type fields for the API body request
    const file = new FormData();
    file.append('id',this.state.id);
    file.append('username',this.state.username);
    file.append('type',this.state.type);

    
    //POST request to the API sending the above created fields of an user to update, and the token for API auth in the request headers
    axios.post('http://localhost:2000/update-user',file, {
        headers: {
          'content-type': 'multipart/form-data',
          'token': this.state.token
        }
      //If the user was succefully updated, show a success message to the user,
      //close the edit user modal dialog, and reset the class state fields,
      //also, reset the users table, as an user has been updated
      }).then((res) => {
      swal({
        text: res.data.title,
        icon: "success",
        type: "success"
      });
      this.handleProductEditClose();
      this.getUsers();
    //Handle any exceptions thrown by the API call returned promise, and show an error message to the user
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
      this.handleProductEditClose();
    });

  }

  //Handle the new user open modal dialog, by setting the state fields
  handleProductOpen = () => {
    this.setState({
      openProductModal: true,
      id: '',
      username: '',
      password: '',
      type: ''
    });
  };

  //Handle the new user close modal dialog, by setting the state fields
  handleProductClose = () => {
    this.setState({ openProductModal: false });
    this.setState({username:''});
    this.setState({password:''});
    this.setState({type:''});
  };

  //Handle the edit user open modal dialog, by setting the state fields
  handleProductEditOpen = (data) => {
    this.setState({
      openProductEditModal: true,
      id: data._id,
      username: data.username,
      type: data.type
    });
  };

  //Handle the edit user close modal dialog, by setting the state fields
  handleProductEditClose = () => {
    this.setState({
        openProductEditModal: false,
        id: '',
        username: '',
        type: ''
      });
  };
  

  //Render the UI for the user
  render() {
    return (
      <div>
        {this.state.loading && <LinearProgress size={40} />}
        {/* Main Menu Buttons */}
        <div>
          <h2>Dashboard</h2>
          <Button
            className="button_style"
            variant="contained"
            color="primary"
            size="small"
            onClick={this.handleProductOpen}
          >
            Add User
          </Button>
        </div>

        {/* Edit User */}
        <Dialog
          open={this.state.openProductEditModal}
          onClose={this.handleProductClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Edit User</DialogTitle>
          <DialogContent>
          <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="username"
              value={this.state.username}
              onChange={this.onChange}
              placeholder="New Username"
              required
            /><br /> 
            <ComboBox
              options={this.ReturnUserTypeOptions()}
              enableAutocomplete
              name="type"
              placeholder={this.state.type}
              onChange={this.onChange}
              onSelect={(option) => this.setState({type: option})}
              required
            /><br />          
          </DialogContent>

          <DialogActions>
            <Button onClick={this.handleProductEditClose} color="primary">
              Cancel
            </Button>
            <Button
              disabled={this.state.username == '' || this.state.type == ''}
              onClick={(e) => this.updateUser()} color="primary" autoFocus>
              Edit User
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add User */}
        <Dialog
          open={this.state.openProductModal}
          onClose={this.handleProductClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Add New User</DialogTitle>
          <DialogContent>
            <TextField ref="usernameField"
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="username"
              value={this.state.username}
              onChange={this.onChange}
              placeholder="New Username"
              required
            /><br /> 
            <TextField ref="passwordField"
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="password"
              value={this.state.password}
              onChange={this.onChange}
              placeholder="Password"
              required
            /><br /> 
            <ComboBox ref="typeField"
              options={this.ReturnUserTypeOptions()}
              enableAutocomplete
              name="type"
              value={this.state.type}
              onChange={this.onChange}
              onSelect={(option) => this.setState({type: option})}
              required
            /><br />          
          </DialogContent>

          <DialogActions>
            <Button onClick={this.handleProductClose} color="primary">
              Cancel
            </Button>
            <Button
              onClick={(e) => this.addUser()} color="primary" autoFocus>
              Add User
            </Button>
          </DialogActions>
        </Dialog>

        <br />
        {/* Users Table */}
        <TableContainer>
          <TextField
            id="standard-basic"
            type="search"
            autoComplete="off"
            name="search"
            value={this.state.search}
            onChange={this.searchForItems}
            placeholder="Search by username or user type"
            required
          />
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Username</TableCell>
                <TableCell align="center">Type</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.users.map((row) => (
                <TableRow key={row.itemName}>
                  <TableCell align="center">{row.username}</TableCell>
                  <TableCell align="center">{row.type}</TableCell>
                  <TableCell align="center">
                    <Button
                      className="button_style"
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={(e) => this.handleProductEditOpen(row)}
                    >
                      Edit
                  </Button>
                    <Button
                      className="button_style"
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={(e) => this.deleteUser(row._id)}
                    >
                      Delete
                  </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <br />
        </TableContainer>
      </div>
    );
  }
}