import { useAppStore } from "@/store";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ChatContainer from "@/pages/chat/components/chat-containter";
import EmptyChatContainer from "@/pages/chat/components/empty-chat-container";
import ContactsContainer from "@/pages/chat/components/contacts-containter";

const Chat = () =>{
    const {userInfo, selectedChatType} = useAppStore();
    const navigate = useNavigate();
    useEffect(()=>{
        if(!userInfo.profileSetup){
            toast("please setup your profile to continue");
            navigate("/profile");
        }
    }, [userInfo, navigate]);

    return (<div className="flex h-[100vh] text-white overflow-hidden">
<ContactsContainer/>
{
    selectedChatType=== undefined ?(
         <EmptyChatContainer/>):( <ChatContainer/>
)}

    </div>)
};
export default Chat;