import React from 'react';

const EmptyChatContainer = () => {
  return (
    <div className='flex-1 bg-[#FFDFEF] md:flex flex-col justify-center items-center hidden duration-1000 transition-all'>
      <video
        src="/culture.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="h-full w-auto max-h-full rounded-2xl shadow-xl object-contain"
      />
    </div>
  );
};

export default EmptyChatContainer;
