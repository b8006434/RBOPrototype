import React from 'react';
import { useState } from 'react';
import { SendOutlined, PictureOutlined } from '@ant-design/icons';
import { sendMessage, isTyping } from 'react-chat-engine';

//Set the message form fields into props
const MessageForm = (props) => {
  const [value, setValue] = useState('');
  const { chatId, creds } = props;

  //Set value for the message, and see if the other user is typing
  const handleChange = (event) => {
    setValue(event.target.value);

    isTyping(props, chatId);
  };

  //Handle the submission of the message
  const handleSubmit = (event) => {
    event.preventDefault();

    //Trim any whitespaces after the typed value
    const text = value.trim();

    //If the typed value is valid, send message in the chat
    if (text.length > 0) {
      sendMessage(creds, chatId, { text });
    }

    setValue('');
  };

  //Handle upload of images
  const handleUpload = (event) => {
    //Send the uploaded files to the correct chat
    sendMessage(creds, chatId, { files: event.target.files, text: '' });
  };

  //Generate the UI of the message form for the user
  return (
    <form className="message-form" onSubmit={handleSubmit}>
      <input
        className="message-input"
        placeholder="Send a message..."
        value={value}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
      <label htmlFor="upload-button">
        <span className="image-button">
          <PictureOutlined className="picture-icon" />
        </span>
      </label>
      <input
        type="file"
        multiple={false}
        id="upload-button"
        style={{ display: 'none' }}
        onChange={handleUpload.bind(this)}
      />
      <button type="submit" className="send-button">
        <SendOutlined className="send-icon" />
      </button>
    </form>
  );
};

export default MessageForm;