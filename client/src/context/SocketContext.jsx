import { useAppStore } from '@/store';
import { createContext,useContext, useRef, useEffect } from 'react';
import { HOST } from '@/utils/constants';
import {io} from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () =>{
    return useContext(SocketContext);
};

export const SocketProvider = ({children})=>{
    const socket = useRef();
    const {userInfo} = useAppStore();

    useEffect(()=>{
        if(userInfo){
            socket.current = io(HOST,{
                withCredentials: true,
                query: {userId: userInfo.id},
            });

            socket.current.on("connect", ()=>{
                console.log("connected to socket server");
            });
            
            socket.current.on("connect_error", (error) => {
                console.error("Socket connection error:", error);
            });

            socket.current.on("disconnect", (reason) => {
                console.log("Disconnected from socket server:", reason);
            });
           
            const handleRecieveMessage = (message) =>{
                const {selectedChatData, selectedChatType, addMessage} = useAppStore.getState();
                if(selectedChatType!== undefined && 
                    (selectedChatData._id === message.sender._id 
                        || selectedChatData._id === message.recipient._id)){
                            console.log("message recieved", message);
                addMessage(message);
                }
            };

            socket.current.on("receiveMessage", handleRecieveMessage);
            
            return () =>{
                socket.current.disconnect();
            }
        }
      
    }, [userInfo])
    return (
        <SocketContext.Provider value= {socket.current}> 
            {children}
        </SocketContext.Provider>
    )
};