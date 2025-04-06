import { useAppStore } from '@/store';
import React from 'react';
import {RiCloseFill} from 'react-icons/ri';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { HOST } from '@/utils/constants';
import { getColor } from '@/lib/utils';

const ChatHeader = () => {
  const {closeChat, selectedChatData, selectedChatType} = useAppStore();

  return (
    <div className='h-[10vh] border-b-2 border-[#433878] flex items-center justify-between px-20'>
        <div className='flex gap-5 items-center w-full justify-between'>
            <div className='flex gap-3 items-center justify-center'>
              
            <div className="w-12 h-12 relative">
    
    <Avatar className="h-12 w-12 rounded-full overflow-hidden">
        {selectedChatData.image ? (
            <AvatarImage src={`${HOST}/${selectedChatData.image}`} 
            alt="profile" 
            className="object-cover w-full h-full bg-[#7E60BF]" />
        ) : (
            <div className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full 
            ${getColor(selectedChatData.color)}`}>
                {selectedChatData.firstName ? 
                selectedChatData.firstName.split("").shift() : 
               selectedChatData.email.split("").shift()}
            </div>
        )}
    </Avatar>
</div>

<div className="text-[#FFE1FF]">
  {selectedChatType === "contact" && selectedChatData ? (
    selectedChatData.firstName ? 
      `${selectedChatData.firstName} ${selectedChatData.lastName}` : 
      selectedChatData.email
  ) : (
    <span>No contact selected</span>
  )}
</div>

            </div>
            <div className='flex items-center justify-center gap-5'>
                <button className='text-[#E4B1F0] hover:text-[#FFE1FF] focus:border-none focus:outline-none
                 focus:text-[#FFE1FF] duration-300 transition-all' onClick={closeChat}>
                    <RiCloseFill className='text-3xl'/>
                </button>
            </div>
        </div>
 
    </div>
  )
}

export default ChatHeader;