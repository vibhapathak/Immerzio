import React from 'react';

const EmptyChatContainer = () => {
  return (
    <div className='flex-1 bg-[rgb(250,217,233)] md:flex flex-col justify-center items-center hidden duration-1000 transition-all'>
      <video
        src="/culture.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="h-full w-auto max-h-full object-contain"
      />
    </div>
  );
};

export default EmptyChatContainer;
