import React, { Component } from 'react';
import swal from 'sweetalert';
import { Button, TextField, Link } from '@material-ui/core';
const axios = require('axios');

//The default constructor for the Register class
//This initializes the state for the class
export default class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      confirm_password: ''
    };
  }

  //On data change, set the state of the field to the changed value
  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  //Register method, which runs when the 'Register' button is presseed
  //This calls the 'register' API
  register = () => {

    //If the entered passwords do not match, reset the values for the fields,
    //and display a warning message to the user
    if(this.state.password != this.state.confirm_password)
    {
      this.setState({password: ''});
      this.setState({confirm_password: ''});

      swal({
        text: "Passwords do not match!",
        icon: "warning",
        type: "warning"
      });

      return;
    }

    //POST API call which send the username, and password to the API in the body
    //Every registered user is a 'client' user, so we can just pass that on
    axios.post('http://localhost:2000/register', {
      username: this.state.username,
      password: this.state.password,
      type: "Client",
    //If the register was successfull, display a success message to the user
    }).then((res) => {
      swal({
        text: res.data.title,
        icon: "success",
        type: "success"
      });
      this.props.history.push('/');
    //If the register fails, handle exceptions and display an error message to the user    
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
    });
  }

  //Render the UI
  render() {
    return (
      <div style={{ marginTop: '200px' }}>
        <div>
          <h2>Register</h2>
        </div>
      {/* Username, Password, Confirm Password text fields */}
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
          <TextField
            id="standard-basic"
            type="password"
            autoComplete="off"
            name="confirm_password"
            value={this.state.confirm_password}
            onChange={this.onChange}
            placeholder="Confirm Password"
            required
          />
          <br /><br />
           {/* Login/Register buttons */}
          <Button
            className="button_style"
            variant="contained"
            name = "signupBttn"
            color="primary"
            size="small"
            disabled={this.state.username == '' && this.state.password == ''}
            onClick={this.register}
          >
            Register
          </Button> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <Link href="/">
            Login
          </Link>
        </div>
      </div>
    );
  }
}
