import React, { Component, useState } from 'react';
import {
  Button, TextField, Dialog, DialogActions, LinearProgress,
  DialogTitle, DialogContent, TableBody, Table,
  TableContainer, TableHead, TableRow, TableCell
} from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import swal from 'sweetalert';
import {Link} from "react-router-dom";
const axios = require('axios');

//The default constructor for the EmployeeDashboard class
//This initializes the state for the class
export default class EmployeeDashboard extends Component {
  constructor() {
    super();
    this.state = {
      token: '',
      openProductModal: false,
      openProductEditModal: false,
      openReviewModal: false,
      id: '',
      search: '',
      tickets: [],
      loading: false,
      itemName: '',
      employee: '',
      cost: ''
    };
  }

  //Verify that the logged in user is valid, when  this class is placed in the DOM
  //If the user token is not valid, redirect the user to the login page
  //Otherwise, set the token in the state and return all requests in queue for the employee user  
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

  //Return all requests in queue for the Employee user
  //This calls the 'get-ticket' API
  getProduct = () => {
    
    this.setState({ loading: true });

     //Call the API to return all tickets for the Employee user, passing the log in token in headers for API auth
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

  //Return all requests assigned to the current Employee user
  //This calls the 'get-ticket' API
  getMyTickets = () => {
    
    this.setState({ loading: true, employee: 'Yes' });

    //Call the API to return all tickets assigned to the Employee user, passing the log in token in headers for API auth
    axios.get(`http://localhost:2000/get-mytickets`, {
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
    //If tickets were returned, set the state tickets to the returned value
    }).then((res) => {
      this.setState({ loading: false, tickets: res.data.tickets});
    //Otherwise display an error to the user and set the class tickets to null
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
  updateProduct = (id,status,allowedCost) => {

    //Create form data to be sent to the API, setting the ID and cost of the item in a request
    const file = new FormData();
    file.append('id',id ?? this.state.id);
    file.append('cost',this.state.cost);

    //If the request status is 'User To Review', set the employee to null and append the status
    if(status == 'User To Review')
    {
      file.append('state', status);
      file.append('employee', '');
    }
    //Otherwise, if the request is 'Allocate Employee', set the employee and status as below
    else if(status == 'Allocate Employee')
    {
      file.append('employee', 'selectFromDb');
      file.append('state','Review Cost');
    }
    //Else if status was passed in, set the status to 'Further Review Required if that's what was passed in,
    //otherwise, set the status to 'Allocated' and append the employee and state to the request
    else if(status)
    {
      if(status == 'Further Review Required')
      {
        file.append('allowedCost',allowedCost);
      }

      file.append('employee', '');
      file.append('state', status ?? 'Allocated');
    }

    //Run the API to update a ticket, passing in the fields appended above in the body, and
    //pass in the login token for the user in the API headers, to authorize this
    axios.post('http://localhost:2000/update-ticket', file, {
      headers: {
        'content-type': 'multipart/form-data',
        'token': this.state.token
      }
    //If the ticket was updated, update the tickets shown and show a success message to the user
    }).then((res) => {
      swal({
        text: res.data.title,
        icon: "success",
        type: "success"
      });
        this.getProduct();
    //Otherwise, the update failed, so display an error message to the user
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
    });
    this.handleProductEditClose();
    this.handleProductEditReviewClose();
  }


  //Randomly generate the max allowed cost for an item
  submitForReview =() =>{

    //Generate the maximum allowed cost, min. is 0.99, and maximum is 99.99
    var allowedCost = (Math.random() * (0.99,99.99) + 0.0200).toFixed(2);

    //If the cost exceeds the max cost, mark the ticket for an admin review
    if(parseFloat(this.state.cost) > parseFloat(allowedCost))
    {
      this.updateProduct(null,"Further Review Required",allowedCost);
    }
    //Otherwise, set the request item as purchased
    else
    {
      this.updateProduct(null,"Purchased",null);
    }
  }

  //Handle the new product open modal dialog, by setting the state fields
  handleProductOpen = () => {
   this.setState({
      openProductModal: true,
      id: '',
      itemName: ''
      });
  };

 //Handle the new product close modal dialog, by setting the state fields
  handleProductClose = () => {
    this.setState({ openProductModal: false });
  };

  //Handle the edit product open modal dialog, by setting the state fields
  //This is called, when the 'Allocate' button is clicked, so allocate the employee to the request
  handleProductEditOpen = (data) => {
    this.setState({
      openProductEditModal: true,
      id: data._id,
      itemName: data.itemName
    });

    this.updateProduct(data._id,'Allocate Employee',null);
  };

 //Handle the edit product close modal dialog, by setting the state fields
  handleProductEditClose = () => {
    this.setState({ openProductEditModal: false });
  };

  //Handle the review product open modal dialog, by setting the state fields
  handleProductEditReviewOpen = (data) => {
    this.setState({
      openReviewModal: true,
      id: data._id,
      itemName: data.itemName
    });
  };

  //Handle the review product close modal dialog, by setting the state fields
  handleProductEditReviewClose = () => {
    this.setState({ openReviewModal: false, cost: '' });
  };

  //Generate the UI for EmployeedDashboard for the user
  render() {
    return (
      <div>
        {this.state.loading && <LinearProgress size={40} />}
        {/* Main Menu Buttons */}
        <div>
          <h2>Employee Dashboard</h2>
          <Button
            className="button_style"
            variant="contained"
            size="small"
            onClick={this.getProduct}
          >
            Queue
          </Button>
          <Button
            className="button_style"
            variant="contained"
            size="small"
            onClick={this.getMyTickets}
          >
            My Tickets
          </Button>
          <Link
                  to={{
                    pathname: 'chat/0',
                    search: "",
                    hash: ""
                    }}
                    target="_blank">
                      <Button
                      className="button_style"
                      color = "primary"
                      variant="contained"
                      size="small"
                      >
                      Support Tickets
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

        {/* Review Ticket */}
        <Dialog
          open={this.state.openReviewModal}
          onClose={this.handleProductEditReviewClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Set Item Price</DialogTitle>
          <DialogContent>
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="cost"
              value={this.state.cost}
              onChange={this.onChange}
              placeholder="Item Cost"
              required
            /><br />
          </DialogContent>

          <DialogActions>
            <Button onClick={this.handleProductEditReviewClose} color="primary">
              Cancel
            </Button>
            <Button
              disabled={this.state.cost == ''}
              onClick={(e) => this.submitForReview()} color="primary" autoFocus>
              Submit Review
            </Button>
            <Button
              disabled={this.state.cost != ''}
              onClick={(e) => this.updateProduct(null,'User To Review',null)} color="primary" autoFocus>
              Send Back To Client
            </Button>
          </DialogActions>
        </Dialog>

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
                <TableCell align="center">Employee</TableCell>
                <TableCell align="center">Allocate Ticket</TableCell>
                <TableCell align="center">Review Ticket</TableCell>
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
                  <TableCell align="center">{row.employee}</TableCell>
                  <TableCell align="center">
                    <Button
                      className="button_style"
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={(e) => this.handleProductEditOpen(row)}
                      style={{visibility: row.employee ? "hidden" : "visible"}}
                    >
                      Allocate   

                      </Button>
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      className="button_style"
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={(e) =>this.handleProductEditReviewOpen(row)}
                      style={{visibility: row.employee ? "visible" : "hidden"}}
                    >
                      Review   

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