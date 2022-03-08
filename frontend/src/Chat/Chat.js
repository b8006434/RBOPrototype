import React, { Component }  from 'react';
import { ChatEngine } from 'react-chat-engine';
import './Chat.css';
import ChatFeed from './ChatFeed';
import { render } from 'react-dom';
import { withRouter } from 'react-router-dom';
import { NewChatForm } from 'react-chat-engine';

const axios = require('axios');

//Default constructor, that initializes state
//The request ID field, reqID, is set by the dynamic URI
class Chat extends Component {
    constructor(props){
     super(props);
     this.state = {
         grid: [], 
         reqID: props.match.params.requestID
 };
 }

 //Create a new chat for a request ticket
 //If a chat already exists for the request ticket, it will not create a new one!!!
 createChatForRequestTicket()
 {
   //If the request ticket ID is incorrect, cancel the creation of the ticket
   if(this.state.reqID == 0 || this.state.reqID == -1)
   {
     return;
   }
   
  //Get the username and password for the client user which is creating the request
  var username = localStorage.getItem('username');
  var password = localStorage.getItem('pwd');
  
  //TODO: Allocation of the ticket to a random employee, once more employees are added
  //Set the body of a request with the correct fields - 
        //Usernames: username of the employee user
        //Title: Title of the chat, should be the request ID
        //Is_Direct_Chat: Should always be true, this is not allowing for more than 2 users to be added to a chat
  var data = {"usernames": ["employeeuser"],"title": "Request Ticket ID: " + this.state.reqID, "is_direct_chat": true};

  //Set up the API call to the chats, passing the RBO project id, and the username + password of the user creating the chat in the headers,
  //and passing the body with the created fields above
  var config = {
    method: 'put',
    url: 'https://api.chatengine.io/chats/',
    headers: { 
      'Project-ID': '{{76ad996b-52ae-4afd-b148-ed9d905b9951}}', 
      'User-Name': username, 
      'User-Secret': password
    },
    data : data
  };
  
  //Run the API call, and log the result
  axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })
  //Catch and handle any exceptions returned by the promise
  .catch(function (error) {
    console.log(error);
  });
 }

 //Render the UI
 render() { 
  //Create a new chat for the requested ticket
  this.createChatForRequestTicket();
  //Create a new chat UI to display to the user
     return (
         <div>
           <ChatEngine
            height="100vh"
            projectID = "76ad996b-52ae-4afd-b148-ed9d905b9951"
            userName= {localStorage.getItem('username')}
            userSecret={localStorage.getItem('pwd')}
            renderChatFeed={(chatAppProps) => <ChatFeed {...chatAppProps} />}
            onNewMessage={() => new Audio('https://chat-engine-assets.s3.amazonaws.com/click.mp3').play()}
          />
         </div>
     );
 
 }
}
//Export the class with router, in order to use dynamic URI to pass the request ID to the constructor
export default withRouter(Chat);
      