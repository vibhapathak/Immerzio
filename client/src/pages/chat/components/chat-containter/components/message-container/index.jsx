import { useAppStore } from '@/store';
import React, { useEffect, useRef, useState } from 'react';
import moment from 'moment';
import { apiClient } from '@/lib/api-client';
import { GET_ALL_MESSAGES_ROUTE } from '@/utils/constants';
import { useSocket } from '@/context/SocketContext';

const LANGUAGES = {
  en: "English",
  hi: "Hindi",
  ja: "Japanese",
  de: "German"
};

const MessageContainer = () => {
  const scrollRef = useRef();
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const socket = useSocket();

  const {
    selectedChatType,
    userInfo,
    selectedChatData,
    selectedChatMessages,
    setSelectedChatMessages // Note the capital S here - matches how it's defined in createChatSlice
  } = useAppStore();

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await apiClient.post(
          GET_ALL_MESSAGES_ROUTE,
          { id: selectedChatData._id },
          { withCredentials: true }
        );
        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.log({ error });
      }
    };

    if (selectedChatData?._id && selectedChatType === "contact") {
      getMessages();
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages]);

  // In MessageContainer.js - add this to your useEffect for socket
  useEffect(() => {
    if (socket) {
      const handleTranslationUpdate = (updatedMessage) => {
        console.log("Received translation update:", updatedMessage);
        console.log("Current messages before update:", selectedChatMessages);
        setSelectedChatMessages(prev => {
          const updated = prev.map(msg => 
            msg._id === updatedMessage._id ? updatedMessage : msg
          );
          console.log("Messages after update:", updated);
          return updated;
        });
      };
      
      console.log("Setting up updateTranslations listener");
      socket.on("updateTranslations", handleTranslationUpdate);
      
      return () => {
        console.log("Removing updateTranslations listener");
        socket.off("updateTranslations", handleTranslationUpdate);
      };
    }
  }, [socket, setSelectedChatMessages]);

  const renderMessage = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;

      return (
        <div key={index}>
          {showDate && (
            <div className="text-center text-[#E4B1F0] my-2">
              {moment(message.timestamp).format('LL')}
            </div>
          )}
          {selectedChatType === "contact" && renderDMMessages(message)}
        </div>
      );
    });
  };

  const renderDMMessages = (message) => {
    const isReceived = message.sender === selectedChatData._id;
    
    // This is the crucial part - make sure we're accessing the correct language
    const msgText = message.translations && 
                    message.translations[selectedLanguage] ? 
                    message.translations[selectedLanguage] : 
                    (message.original || message.content);
    
    return (
      <div className={`${isReceived ? "text-left" : "text-right"}`}>
        {message.messageType === "text" && (
          <div className={`${
            isReceived
              ? 'bg-[#E4B1F0]/20 text-[#FFE1FF] border-[#E4B1F0]/50'
              : 'bg-[#7E60BF]/20 text-[#FFE1FF] border-[#7E60BF]/50'
          } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}>
            {msgText}
          </div>
        )}
        <div className="text-xs text-[#E4B1F0]">
          {moment(message.timestamp).format("LT")}
        </div>
      </div>
    );
  };
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full bg-[#433878]">
      {/* Language Selector */}
      <div className="mb-4">
        <label className="text-[#FFE1FF] mr-2">Translate to:</label>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="bg-[#7E60BF] text-[#FFE1FF] p-2 rounded border border-[#E4B1F0]"
        >
          {Object.entries(LANGUAGES).map(([code, name]) => (
            <option key={code} value={code}>{name}</option>
          ))}
        </select>
      </div>

      {selectedChatMessages.length > 0 ? renderMessage() : (
        <div className="text-center text-[#E4B1F0] mt-10">No messages yet</div>
      )}
      <div ref={scrollRef}></div>
    </div>
  );
};

export default MessageContainer;