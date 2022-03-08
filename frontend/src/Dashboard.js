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

//The default constructor for the Dashboard class
//This initializes the state for the class
export default class Dashboard extends Component {
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


  //Return all requests for the Client user
  //This calls the 'get-ticket' API
  getProduct = () => {
    
    this.setState({ loading: true });

    //Call the API to return all tickets for the Client user, passing the log in token in headers for API auth
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

  //Delete a request, this calls the 'delete-ticket' API
  //ID field of the item to delete is passed in by the table, when the 'Delete' button is clicked
  deleteProduct = (id) => {

    //Set the POST API request up, by passing in the ID of the request ticket to be deleted,
    //pass in the log in token to authorize the API call
    axios.post('http://localhost:2000/delete-ticket', {
      id: id
    }, {
      headers: {
        'Content-Type': 'application/json',
        'token': this.state.token,
        'query': this.state.search
      }
    //If the deleteion was succesfull, update the list of tickets and return a success message to the user
    }).then((res) => {
      this.getProduct();
      swal({
        text: res.data.title,
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

  //Search the requests table by the search bar, calling the 'search-tickets' API
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

  //Add a new request item, calling the 'add-ticket' API
  addProduct = () => {

    //Create a new form data object to be passed in the API request body
    //Set the request item name field
    const file = new FormData();
    file.append('itemName',this.state.itemName);

    //Call the POST API, passing in the form data object above in the body,
    //and the token for API auth in the headers
    axios.post('http://localhost:2000/add-ticket', file, {
      headers: {
        'content-type': 'multipart/form-data',
        'token': this.state.token
      }
    //If the ticket was succefully added, show a success message to the user,
    //close the add product modal dialog, and reset the class state fields,
    //also, refresh the tickets table, as a new ticket has been added
    }).then((res) => {
      swal({
        text: res.data.title,
        icon: "success",
        type: "success"
      });
      this.handleProductClose();
      this.setState({ itemName: '' }, () => {
      this.getProduct();
      });
    //Handle any exceptions thrown by the API call returned promise, and show an error message to the user
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
      this.handleProductClose();
    });

  }


  //Update the ticket,according to the given request item ID, callin the 'update-ticket' API
  updateProduct = () => {

    //Create form data to be sent to the API, setting the ID and name of the item in a request
    const file = new FormData();
    file.append('itemName', this.state.itemName);
    file.append('id',this.state.id);

    //POST request to the API sending the ID and STATE fields of a request to update, and the token for API auth
    axios.post('http://localhost:2000/update-ticket', file, {
      headers: {
        'content-type': 'multipart/form-data',
        'token': this.state.token
      }
    //If the ticket was succefully updated, show a success message to the user,
    //close the add product modal dialog, and reset the class state fields,
    //also, get all tickets, as a ticket has been uupdated
    }).then((res) => {
      swal({
        text: res.data.title,
        icon: "success",
        type: "success"
      });
      this.handleProductEditClose();
      this.setState({ itemName: ''}, () => {
      this.getProduct();
      });
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
  handleProductEditOpen = (data) => {
    this.setState({
      openProductEditModal: true,
      id: data._id,
      itemName: data.itemName
    });
  };

  //Handle the edit product close modal dialog, by setting the state fields
  handleProductEditClose = () => {
    this.setState({ openProductEditModal: false });
  };
  

  //Render the Dashboard UI for the user
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
            Add Request
          </Button>
          <Button
            className="button_style"
            variant="contained"
            size="small"
            onClick={this.logOut}
          >
            Log Out
          </Button>
        </div>

        {/* Edit Ticket */}
        <Dialog
          open={this.state.openProductEditModal}
          onClose={this.handleProductClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Edit Request</DialogTitle>
          <DialogContent>
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="itemName"
              value={this.state.name}
              onChange={this.onChange}
              placeholder="Item Name"
              required
            /><br />
            {this.state.fileName}
          </DialogContent>

          <DialogActions>
            <Button onClick={this.handleProductEditClose} color="primary">
              Cancel
            </Button>
            <Button
              disabled={this.state.name == '' || this.state.desc == '' || this.state.discount == '' || this.state.price == ''}
              onClick={(e) => this.updateProduct()} color="primary" autoFocus>
              Edit Product
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Ticket */}
        <Dialog
          open={this.state.openProductModal}
          onClose={this.handleProductClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Add Item Request</DialogTitle>
          <DialogContent>
            <TextField ref="itemNameField"
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="itemName"
              value={this.state.itemName}
              onChange={this.onChange}
              placeholder="Book/AudioBook Name"
              required
            /><br />        
          </DialogContent>

          <DialogActions>
            <Button onClick={this.handleProductClose} color="primary">
              Cancel
            </Button>
            <Button
              onClick={(e) => this.addProduct()} color="primary" autoFocus>
              Add Request
            </Button>
          </DialogActions>
        </Dialog>

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
                <TableCell align="center">Client</TableCell>
                <TableCell align="center">Requested Item Name</TableCell>
                <TableCell align="center">Request Date</TableCell>
                <TableCell align="center">State</TableCell>
                <TableCell align="center">State Date</TableCell>
                <TableCell align="center">Actions</TableCell>
                <TableCell align="center">Help</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.tickets.map((row) => (
                <TableRow key={row.itemName}>
                  <TableCell align="center">{row.client}</TableCell>
                  <TableCell align="center">{row.itemName}</TableCell>
                  <TableCell align="center">{row.ticketDate}</TableCell>
                  <TableCell align="center">{row.state}</TableCell>
                  <TableCell align="center">{row.stateChangeDate}</TableCell>
                  <TableCell align="center">
                    <Button
                      className="button_style"
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={(e) => this.handleProductEditOpen(row)}
                      style={{visibility: (row.state == "Created" || row.state == "User To Review") ? "visible" : "hidden"}}
                    >
                      Edit
                  </Button>
                    <Button
                      className="button_style"
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={(e) => this.deleteProduct(row._id)}
                      style={{visibility: (row.state == "Created" || row.state == "User To Review") ? "visible" : "hidden"}}
                    >
                      Delete
                  </Button>
                  </TableCell>
                  <TableCell align="center">
                  <Link
                  to={{
                    pathname: 'chat/' + row.ticketNumber,
                    search: "",
                    hash: ""
                    }}
                    target="_blank">
                      <Button
                      className="button_style"
                      variant="contained"
                      color="primary"
                      size="small"
                      style={{visibility: row.state != "Purchased" ? "visible" : "hidden"}}
                      >
                      Request Help
                  </Button>
                    </Link>
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