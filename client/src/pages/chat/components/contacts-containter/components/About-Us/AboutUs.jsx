import React, { useState, useRef } from 'react';
import { Play } from 'lucide-react';

const AboutUs = () => {
  const [showAboutMe, setShowAboutMe] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);
  
  const localVideoPath = '/videos/about_company.mp4';
  
  const handleOpenAboutMe = () => {
    setShowAboutMe(true);
  };
  
  const handleVideoError = () => {
    console.error("Video failed to load:", localVideoPath);
    setVideoError(true);
  };
  
  const handleVideoLoad = () => {
    console.log("Video loaded successfully");
    setVideoError(false);
  };
  
  const playVideo = () => {
    setShowVideo(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch(e => {
          console.error("Video playback failed:", e);
          setVideoError(true);
        });
      }
    }, 100);
  };

  return (
    <>
      <button
        onClick={handleOpenAboutMe}
        className="flex items-center justify-center p-2 bg-[#7E68C1] hover:bg-[#6A57A5] rounded-full transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFE1FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      {showAboutMe && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-md overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setShowAboutMe(false)}
              className="absolute top-4 right-4 p-2 bg-[#7E68C1] hover:bg-[#6A57A5] rounded-full text-white transition-colors z-10"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="flex flex-col items-center w-full p-6">
              <div className="w-full max-w-3xl">
                <h2 className="text-3xl font-bold mb-4 text-center" style={{ color: '#433878'}}>
                  About Us
                </h2>

                <img style={{ height: '220px'}}
                  src="Immerzio.png" 
                  alt="Immerzio Logo" 
                  className="mx-auto mb-6 max-w-full h-auto"
                />

                <div className="mb-6 text-gray-700">
                  <p className="mb-4">
                    Immerzio is a cultural exchange platform 🌏 that facilitates meaningful interactions between people from diverse cultural backgrounds 🌍. 
                    It aims to bridge cultural gaps by providing a space for users to share their traditions, experiences, and perspectives 🤝.
                  </p>
                  <p className="mb-4">
                    Through conversations, activities, and events 🎉✨, Immerzio encourages mutual learning, respect, and global connections 🌐. 
                    The platform is designed to foster an inclusive environment where individuals can celebrate their differences while discovering common ground 🤗🚀.
                  </p>
                </div>
                
                {!showVideo ? (
                  <div className="flex justify-center mb-6">
                    <button
                      onClick={playVideo}
                      className="flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: '#7E60BF' }}
                    >
                      <Play size={20} />
                      <span>About Immerzio</span>
                    </button>
                  </div>
                ) : (
                  <div className="w-full mb-6">
                    <div className="relative pt-1" style={{ paddingBottom: '56.25%' }}>
                      <div className="absolute inset-0 rounded-lg overflow-hidden bg-black">
                        {videoError ? (
                          <div className="flex flex-col items-center justify-center w-full h-full text-white">
                            <p className="mb-2">Video could not be loaded</p>
                            <p className="text-sm text-gray-300">File: {localVideoPath}</p>
                            <button 
                              onClick={() => setShowVideo(false)}
                              className="mt-4 px-4 py-2 bg-[#7E60BF] rounded-lg hover:bg-[#6A57A5]"
                            >
                              Back
                            </button>
                          </div>
                        ) : (
                          <video
                            ref={videoRef}
                            className="w-full h-full object-cover"
                            controls
                            onError={handleVideoError}
                            onLoadedData={handleVideoLoad}
                          >
                            <source src={localVideoPath} type="video/mp4" />
                            <source src={localVideoPath.replace('.mp4', '.webm')} type="video/webm" />
                            Your browser does not support the video tag.
                          </video>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="p-5 rounded-lg" style={{ backgroundColor: '#FFE1FF' }}>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#433878' }}></h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AboutUs;
