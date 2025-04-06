import React from 'react';
import MessageContainer from './components/message-container';
import MessageBar from './components/message-bar';
import ChatHeader from './components/chat-header';

const ChatContainer = () => {
  return (
    <div className='fixed top-0 w-[100vw] h-[100vh] bg-[#433878] flex flex-col md:static md:flex-1'>
      <ChatHeader />
      <MessageContainer />
      <MessageBar />
    </div>
  );
}

export default ChatContainer;