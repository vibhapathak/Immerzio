import { useSocket } from '@/context/SocketContext'; 
import { useAppStore } from '@/store'; 
import EmojiPicker from 'emoji-picker-react'; 
import React, { useEffect, useRef, useState } from 'react'; 
import { GrAttachment } from 'react-icons/gr'; 
import { IoSend } from 'react-icons/io5'; 
import { RiEmojiStickerLine } from 'react-icons/ri'; 
import axios from 'axios';

const MessageBar = () => {
  const emojiRef = useRef();
  const socket = useSocket();
  const [message, setMessage] = useState("");
  const { selectedChatData, selectedChatType, userInfo } = useAppStore();
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [translationStatus, setTranslationStatus] = useState("idle"); // "idle", "pending", "complete", "error"

  // Azure translation configuration
  const azureTranslationEndpoint = 'https://api.cognitive.microsofttranslator.com';
  const azureTranslationApiKey = "6PWFQJqiustHS6ZBjLmO3VNVLTShadtczpuGPctPERu3JOmYaRokJQQJ99BDACHYHv6XJ3w3AAAbACOGSa2D";
  const azureTranslationRegion = "eastus2";

  // Translate message to multiple languages using Azure
  const translateMessage = async (text, targetLang) => {
    if (targetLang === 'en') return text;
    try {
      const response = await axios({
        baseURL: azureTranslationEndpoint,
        url: '/translate',
        method: 'post',
        headers: {
          'Ocp-Apim-Subscription-Key': azureTranslationApiKey,
          'Ocp-Apim-Subscription-Region': azureTranslationRegion,
          'Content-type': 'application/json',
        },
        params: {
          'api-version': '3.0',
          'from': 'en',
          'to': targetLang
        },
        data: [{
          'text': text
        }],
        responseType: 'json'
      });
      
      // Extract the translated text from the response
      if (response.data && 
          response.data[0] && 
          response.data[0].translations && 
          response.data[0].translations[0]) {
        return response.data[0].translations[0].text;
      }
      return text; // Fallback
    } catch (err) {
      console.error(`Translation to ${targetLang} failed:`, err);
      return text; // Fall back to original text if translation fails
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setEmojiPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiRef]);

  // Listen for message errors
  useEffect(() => {
    if (socket) {
      const handleMessageError = (errorData) => {
        console.error("Message error:", errorData);
        setTranslationStatus("error");
        // You could also show a toast/notification here
      };
      
      socket.on("messageError", handleMessageError);
      
      return () => {
        socket.off("messageError", handleMessageError);
      };
    }
  }, [socket]);

  const handleAddEmoji = (emoji) => {
    setMessage((msg) => msg + emoji.emoji);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setTranslationStatus("pending");
    
    try {
      // For faster sending, we can send the message first with just English
      const langs = ['en', 'hi', 'ja', 'de'];
      const translations = { en: message }; // Start with English
      
      // Generate a temporary message ID to track this message
      const tempMessageId = Date.now().toString();
      
      // Send message immediately
      if (selectedChatType === "contact") {
        // First emit with just English translation
        socket.emit("sendMessage", {
          sender: userInfo.id,
          recipient: selectedChatData._id,
          messageType: 'text',
          content: message,
          original: message,
          translations: translations,
          _tempId: tempMessageId // Add a temporary ID to track this message
        });
        
        setMessage(""); // Clear input right away
        
        // Then translate to other languages in background
        const translationPromises = langs
          .filter(lang => lang !== 'en')
          .map(async (lang) => {
            const translated = await translateMessage(message, lang);
            translations[lang] = translated;
            return { lang, text: translated };
          });
          
        // Wait for all translations to complete
        const results = await Promise.all(translationPromises);
        
        // Update translations in the server/other clients
        // This assumes your socket.io server can handle an updateTranslations event
        socket.emit("updateTranslations", {
          messageId: tempMessageId, // The temp ID to identify which message to update
          translations: translations
        });
        
        setTranslationStatus("complete");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setTranslationStatus("error");
    }
  };

  return (
    <div className='h-[10vh] bg-[#433878] flex justify-center items-center px-8 py-2 mb-6 gap-6'>
      <div className='flex-1 flex bg-[#7E60BF] rounded-md items-center gap-5 pr-5'>
        <input
          type='text'
          className='flex-1 p-5 bg-transparent rounded-md focus:border-none focus:outline-none text-[#FFE1FF]'
          placeholder='Enter message'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <button className='text-[#E4B1F0] focus:border-none focus:outline-none focus:text-[#FFE1FF] duration-300 transition-all'>
          <GrAttachment className='text-2xl' />
        </button>
        <div className='relative'>
          <button
            className='text-[#E4B1F0] focus:border-none focus:outline-none focus:text-[#FFE1FF] duration-300 transition-all ml-2'
            onClick={() => setEmojiPickerOpen(true)}
          >
            <RiEmojiStickerLine className='text-2xl' />
          </button>
          <div className='absolute bottom-16 right-0' ref={emojiRef}>
            <EmojiPicker
              theme='dark'
              open={emojiPickerOpen}
              onEmojiClick={handleAddEmoji}
              autoFocusSearch={false}
            />
          </div>
        </div>
      </div>
      
      <button
        className={`rounded-md flex items-center justify-center p-5 focus:border-none focus:outline-none focus:text-[#FFE1FF] duration-300 transition-all ${
          translationStatus === "pending" 
            ? 'bg-[#7E60BF] cursor-not-allowed' 
            : 'bg-[#E4B1F0] hover:bg-[#FFE1FF] focus:bg-[#FFE1FF]'
        }`}
        onClick={handleSendMessage}
        disabled={translationStatus === "pending"}
      >
        {translationStatus === "pending" ? (
          <span className="animate-pulse">...</span>
        ) : (
          <IoSend className='text-2xl text-[#433878]' />
        )}
      </button>
    </div>
  );
};

export default MessageBar;