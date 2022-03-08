import React, { Component } from 'react';
import swal from 'sweetalert';
import { Button, TextField, Link } from '@material-ui/core';
const axios = require('axios');
const bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);

//The default constructor for the Login class
//This initializes the state for the class
export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: ''
    };
  }

  //On data change, set the state of the field to the changed value
  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  //Login method, which runs when the 'Login' button is presseed
  //This calls the 'login' API
  login = () => {

    //Encrypt the password with bcrypt
    const pwd = bcrypt.hashSync(this.state.password, salt);

    //POST API call which send the username, and encrypted password to the API in the body
    axios.post('http://localhost:2000/login', {
      username: this.state.username,
      password: pwd,
    //If the login was successfull, set the variables needed in the local storage
    }).then((res) => {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user_id', res.data.id);
      localStorage.setItem('pwd',this.state.password);
      localStorage.setItem('username',this.state.username);

      //Depending on the logged in user type, send them to a different home page
      if(res.data.type == 'Client')
      {
      this.props.history.push('/dashboard');
      }
      else if(res.data.type.toString() == 'Admin')
      {
        this.props.history.push('/admindashboard')
      }
      else if(res.data.type.toString() == 'Employee')
      {
        this.props.history.push('/employeedashboard')
      }
    //If the API call promise returns errors, handle them and show an error message to the user
    }).catch((err) => {
      if (err.response && err.response.data && err.response.data.errorMessage) {
        swal({
          text: err.response.data.errorMessage,
          icon: "error",
          type: "error"
        });
      }
    });
  }

  //Render the UI for the user
  render() {
    return (
      <div style={{ marginTop: '200px' }}>
        <div>
          <h2>Login</h2>
        </div>
      {/* Username, Password text fields */}
        <div>
          <TextField
            id="standard-basic"
            type="text"
            autoComplete="off"
            name="username"
            value={this.state.username}
            onChange={this.onChange}
            placeholder="User Name"
            required
          />
          <br /><br />
          <TextField
            id="standard-basic"
            type="password"
            autoComplete="off"
            name="password"
            value={this.state.password}
            onChange={this.onChange}
            placeholder="Password"
            required
          />
          <br /><br />
          {/* Login/Register buttons */}
          <Button
            className="button_style"
            variant="contained"
            color="primary"
            size="small"
            disabled={this.state.username == '' && this.state.password == ''}
            onClick={this.login}
          >
            Login
          </Button> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <Link href="/register">
            Register
          </Link>
        </div>
      </div>
    );
  }
}
