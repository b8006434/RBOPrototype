import React from 'react';

//If the message sent by the current user contains attachments, generate the photo
const MyMessage = ({ message }) => {
    if (message.attachments && message.attachments.length > 0) {
      return (
        <img
          src={message.attachments[0].file}
          alt="message-attachment"
          className="message-image"
          style={{ float: 'right' }}
        />
      );
    }

    //Return the UI for the 'my message' message field
    return (
      <div className="message" style={{ float: 'right', marginRight: '18px', color: 'white', backgroundColor: '#3B2A50' }}>
        {message.text}
      </div>
    );
  };
  
  export default MyMessage;