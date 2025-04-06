import NewDM from "./components/new-dm";
import ProfileInfo from "./components/profile-info";
import CompleteTranslateVideoCall from "./components/video-translator/CompleteTranslateVideoCall";
import { useState } from 'react';
import AboutUs from "./components/About-Us/AboutUs";
import Storyboard from "./components/storyboard/Storyboard";
import BlogPosts from "./components/Posts";
import { useAppStore } from "@/store";

const ContactsContainer = () => {
  const [showTranslator, setShowTranslator] = useState(false);
  const [showStoryboard, setShowStoryboard] = useState(false);
  const [showBlogPosts, setShowBlogPosts] = useState(false);
  const { setSelectedChatType } = useAppStore();
  
  const handleOpenTranslator = () => {
    setShowTranslator(true);
  };

  const handleOpenPosts = () => {
    setShowBlogPosts(true);
  };

  // If the translator or storyboard is shown, render it full-screen
  if (showTranslator) {
    return (
      <div className="fixed inset-0 bg-[#fbf9ff] z-50 overflow-y-auto">
        <div className="absolute top-4 left-4 z-10">
          <button 
            onClick={() => setShowTranslator(false)}
            className="flex items-center justify-center p-2 bg-[#7E68C1] hover:bg-[#6A57A5] rounded-full text-white transition-colors shadow-md"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFE1FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <div className="py-2">
          <CompleteTranslateVideoCall />
        </div>
      </div>
    );
  }

  if (showStoryboard) {
    return (
      <div className="fixed inset-0 bg-[#fbf9ff] z-50 overflow-y-auto">
        <div className="absolute top-4 left-4 z-10">
          <button 
            onClick={() => setShowStoryboard(false)}
            className="flex items-center justify-center p-2 bg-[#7E68C1] hover:bg-[#6A57A5] rounded-full text-white transition-colors shadow-md"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFE1FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <div className="py-2">
          <Storyboard />
        </div>
      </div>
    );
  }

  // Normal render when no full-screen component is shown
  return (
    <div className="relative md:w-[35vw] lg:w-[30w] xl:w-[20w] bg-[#433878] border-r-2 border-[#7E60BF] w-full">
      <div className="pt-3">
        <Logo></Logo>
      </div>
      
      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text="Direct Messages"/>
          <NewDM/>
        </div>
      </div>
      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text="About Us"/>
          <AboutUs/>
        </div>
      </div>
      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text="Live Video"/>
          <button 
            onClick={handleOpenTranslator}
            className="flex items-center justify-center p-2 bg-[#7E68C1] hover:bg-[#6A57A5] rounded-full transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFE1FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8"></path>
              <line x1="10" y1="12" x2="14" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text="Storyboard" />
          <button 
            onClick={() => setShowStoryboard(true)}
            className="flex items-center justify-center p-2 bg-[#7E68C1] hover:bg-[#6A57A5] rounded-full transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFE1FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="12" y1="8" x2="12" y2="16" />
            </svg>
          </button>
        </div>
      </div>
      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text="Blog Posts" />
          <button 
            onClick={handleOpenPosts}
            className="flex items-center justify-center p-2 bg-[#7E68C1] hover:bg-[#6A57A5] rounded-full transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFE1FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
            </svg>
          </button>
        </div>
      </div>
      
      <ProfileInfo></ProfileInfo>
      
      {/* Show BlogPosts dialog when showBlogPosts is true */}
      {showBlogPosts && <BlogPosts onClose={() => setShowBlogPosts(false)} />}
    </div>
  );
};

export default ContactsContainer;

const Logo = () => {
  return (
    <div className="flex p-5 justify-start items-center gap-2">
      <img style={{ height: '40px'}}
        src="Immerzio.png"
        alt="Immerzio Logo"
        className="w-10 h-10 rounded-full object-cover"
      />
      <span className="text-3xl font-semibold text-[#FFE1FF]">IMMERZIO</span>
    </div>
  );
};

const Title = ({text}) => {
  return(
    <h6 className="uppercase tracking-widest text-[#E4B1F0] pl-10 font-light text-opacity-90 text-sm">{text}</h6>
  );
};