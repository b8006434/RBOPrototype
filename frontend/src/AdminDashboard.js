import React, { Component, useState } from 'react';
import {
  Button, TextField, Dialog, DialogActions, LinearProgress,
  DialogTitle, DialogContent, TableBody, Table,
  TableContainer, TableHead, TableRow, TableCell
} from '@material-ui/core';
import swal from 'sweetalert';
import {Link} from "react-router-dom";

const axios = require('axios');

//The default constructor for the AdminDashboard class
//This initializes the state for the class
export default class AdminDashboard extends Component {
  constructor() {
    super();
    this.state = {
      token: '',
      openProductModal: false,
      openProductEditModal: false,
      id: '',
      search: '',
      tickets: [],
      loading: false,
      itemName: ''
    };
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
        this.getProduct();
      });
    }
  }

  //Return all requests for the Admin user
  //This calls the 'get-ticket' API
  getProduct = () => {
    
    this.setState({ loading: true });

    //Call the API to return all tickets for the Admin user, passing the token in
    axios.get(`http://localhost:2000/get-ticket`, {
      headers: {
        'token': this.state.token
      }
      //If the tickets were returned, set the tickets in the class state
    }).then((res) => {
      this.setState({ loading: false, tickets: res.data.tickets});
      //Otherwise display an error to the user and set tickets to null
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
      this.setState({ loading: false, tickets: []},()=>{});
    });
  }

  //Search the requests by the search bar, calling the 'search-tickets' API
  searchForItems = (e) =>{

    //Set the 'search' field in the state to the value passed in by the search component in the UI
    this.setState({ [e.target.name]: e.target.value }, () => { });
    
    //If the 'search' value is not valid, retrieve all tickets and return
    if(e.target.value == '' || e.target.value == ' ')
    {
      this.getProduct();
      return;
    }

    //Search value is valid, so run the API to search all tickets, where this search will be ran,
    //against all fields in the 'tickets' database, returning matching tickets
    axios.get(`http://localhost:2000/search-tickets`, {
      params: {
        search: e.target.value,
      },
      headers: {
        'token': this.state.token
      }
    //If tickets were returned, set the class state tickets to the returned value
    }).then((res) => {
      this.setState({ loading: false, tickets: res.data.tickets});
    //Otherwise display an error to the user and set the tickets to null
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
      this.setState({ loading: false, tickets: []},()=>{});
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

  //Update the ticket,according to the given by the request item ID, callin the 'update-ticket' API
  updateProduct = (id,status) => {

    //Create form data to be sent to the API, setting the ID and state of a request
    const file = new FormData();
    file.append('id',id ?? this.state.id);
    file.append('state',status);
    
    //POST request to the API sending the ID and STATE fields of a request to update
    axios.post('http://localhost:2000/update-ticket', file, {
      headers: {
        'content-type': 'multipart/form-data',
        'token': this.state.token
      }
    //If the update was succesfull, show the user a success message, null the fields in the class state,
    //and retrieve all tickets, as a ticket was updated
    }).then((res) => {
      swal({
        text: res.data.title,
        icon: "success",
        type: "success"
      });
      this.setState({ itemName: ''}, () => {
      this.getProduct();
      });
    //Catch any unhandled exception returned by the API call promise, and show the user an error message
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
    });
  }

  //Reject a request item, calling the updateProduct method, passing the ticket state in as 'Rejected'
  rejectRequest = (id) =>
  {
    this.updateProduct(id,"Rejected");
  }

  //Approve a request item, calling the updateProduct method, passing the ticket state in as 'Purchased'
  //Maximum allowed cost is a randomly generated number currently
  approveRequest = (data) =>
  {
    //If the cost set by the employee exceedes the maximum cost allowed for the item, show a warning to the user
    if(data.maxCost < data.cost)
    {
      swal({
        text: "The requested price is higher than the maximum allowed price.",
        icon: "warning",
        type: "warning"
      });
    }

    //Else the cost is lower than the maximum cost allowed, therefore update the requested item
    this.updateProduct(data._id,"Purchased");
  }

  //Render the UI for the Admin Dashboard page
  render() {
    return (
      <div>
        {this.state.loading && <LinearProgress size={40} />}
        {/* Main Menu Buttons */}
        <div>
          <h2>Admin Dashboard</h2>
          <Button
            className="button_style"
            variant="contained"
            size="small"
          >
            Manage Tickets
          </Button>
          <Link
                  to={{
                    pathname: 'usermanagement',
                    search: "",
                    hash: ""
                    }}
                    target="_blank">
                      <Button
                      className="button_style"
                      variant="contained"
                      size="small"
                      >
                      Manage Users
                  </Button>
          </Link>
          <Button
            className="button_style"
            variant="contained"
            size="small"
            onClick={this.logOut}
          >
            Log Out
          </Button>
        </div>

        <br />
        {/* Tickets Table */}
        <TableContainer>
          <TextField
            id="standard-basic"
            type="search"
            autoComplete="off"
            name="search"
            value={this.state.search}
            onChange={this.searchForItems}
            placeholder="Search by ticket name"
            required
          />
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Ticket Number</TableCell>
                <TableCell align="center">Client</TableCell>
                <TableCell align="center">Requested Item Name</TableCell>
                <TableCell align="center">Request Date</TableCell>
                <TableCell align="center">State</TableCell>
                <TableCell align="center">State Date</TableCell>
                <TableCell align="center">Item Cost</TableCell>
                <TableCell align="center">Item Max Cost</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.tickets.map((row) => (
                <TableRow key={row.itemName}>
                  <TableCell align="center">{row.ticketNumber}</TableCell>
                  <TableCell align="center">{row.client}</TableCell>
                  <TableCell align="center">{row.itemName}</TableCell>
                  <TableCell align="center">{row.ticketDate}</TableCell>
                  <TableCell align="center">{row.state}</TableCell>
                  <TableCell align="center">{row.stateChangeDate}</TableCell>
                  <TableCell align="center">{row.maxCost}</TableCell>
                  <TableCell align="center">{row.cost}</TableCell>
                  <TableCell align="center">
                    <Button
                      className="button_style"
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={(e) => this.approveRequest(row)}
                    >
                      Approve
                  </Button>
                    <Button
                      className="button_style"
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={(e) => this.rejectRequest(row._id)}
                    >
                      Reject
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