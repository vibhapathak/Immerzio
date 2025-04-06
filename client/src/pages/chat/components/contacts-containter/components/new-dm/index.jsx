import React, { useState } from 'react';
import Input from "@/components/ui/input";
import Lottie from 'react-lottie';
import { HOST } from '@/utils/constants';
import { getColor } from '@/lib/utils';
import { aniamtionDefaultOptions } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FaPlus } from 'react-icons/fa';
import { apiClient } from '@/lib/api-client';
import { SEARCH_CONTACTS_ROUTES } from '@/utils/constants';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/store';
import { Avatar, AvatarImage } from '@/components/ui/avatar';

const NewDM = () => {
  const { setSelectedChatType, setSelectedChatData } = useAppStore();

  const [searchedContacts, setSearchedContacts] = useState([]);
  const [openNewContactModal, setOpenNewContactModal] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state for search

  const searchContacts = async (searchTerm) => {
    try {
      if (searchTerm.length > 0) {
        setLoading(true); // Set loading to true when search starts
        const response = await apiClient.post(SEARCH_CONTACTS_ROUTES, { searchTerm }, { withCredentials: true });
        if (response.status === 200 && Array.isArray(response.data.contacts)) {
          setSearchedContacts(response.data.contacts);
        }
      } else {
        setSearchedContacts([]);
      }
    } catch (error) {
      console.log(error);
      setSearchedContacts([]); // Clear the contacts on error
    } finally {
      setLoading(false); // Set loading to false after the search is complete
    }
  };

  const selectNewContact = (contact) => {
    setOpenNewContactModal(false);
    setSelectedChatType("contact");
    setSelectedChatData(contact);
    setSearchedContacts([]);
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FaPlus
              className='text-[#E4B1F0] font-light text-opacity-90 text-start hover:text-[#FFE1FF] cursor-pointer transition-all duration-300'
              onClick={() => setOpenNewContactModal(true)}
            />
          </TooltipTrigger>
          <TooltipContent className='bg-[#433878] border-none mb-2 p-3 text-[#FFE1FF]'>
            Select New Contact
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={openNewContactModal} onOpenChange={setOpenNewContactModal}>
        <DialogContent className='bg-[#433878] border-none text-[#FFE1FF] w-[400px] h-[400px] flex flex-col'>
          <DialogHeader>
            <DialogTitle>Please Select A Contact</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          <div>
            <Input
              placeholder="Search Contacts"
              className="rounded-lg p-6 bg-[#7E60BF] border-none text-[#FFE1FF]"
              onChange={e => searchContacts(e.target.value)}
            />
          </div>

          {loading && (
            <div className="flex justify-center items-center py-10">
              <Lottie
                isClickToPauseDisabled={true}
                height={100}
                width={100}
                options={aniamtionDefaultOptions}
              />
            </div>
          )}

          {searchedContacts.length > 0 ? (
            <ScrollArea className='h-[250px]'>
              <div className='flex flex-col gap-5'>
                {searchedContacts.map((contact) => (
                  <div
                    key={contact._id}
                    className='flex gap-3 items-center cursor-pointer hover:bg-[#7E60BF]/30 p-2 rounded-md'
                    onClick={() => selectNewContact(contact)}
                  >
                    <div className="w-12 h-12 relative">
                      <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                        {contact.image ? (
                          <AvatarImage
                            src={`${HOST}/${contact.image}`}
                            alt="profile"
                            className="object-cover w-full h-full bg-black rounded-full"
                          />
                        ) : (
                          <div className={`uppercase h-12 w-12 text-lg md:h-48 border-[1px] flex items-center justify-center rounded-full ${getColor(contact.color)}`}>
                            {contact.firstName
                              ? `${contact.firstName.charAt(0)}${contact.lastName?.charAt(0)}`
                              : contact.email.charAt(0)}
                          </div>
                        )}
                      </Avatar>
                    </div>
                    <div className='flex flex-col'>
                      <span>
                        {contact.firstName && contact.lastName
                          ? `${contact.firstName} ${contact.lastName}`
                          : contact.email}
                      </span>
                      <span className='text-xs text-[#E4B1F0]'>{contact.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className='flex-1 flex flex-col justify-center items-center'>
              <Lottie
                isClickToPauseDisabled={true}
                height={100}
                width={100}
                options={aniamtionDefaultOptions}
              />
              <div className='text-opacity-80 text-[#FFE1FF] flex flex-col gap-5 items-center mt-5'>
                <h3 className='poppins-medium'>
                  Hi<span className='text-[#E4B1F0]'>!</span> Search New
                  <span className='text-[#E4B1F0]'> Contacts</span>
                </h3>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewDM;