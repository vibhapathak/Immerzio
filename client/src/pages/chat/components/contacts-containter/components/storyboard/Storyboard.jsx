import { useEffect } from 'react';

const StoryboardRedirect = () => {
  useEffect(() => {
    window.location.href = '/storyboard/Barbaadi/index.html';
  }, []);

  return (
    <div>
      <p>Redirecting to storyboard...</p>
    </div>
  );
};

export default StoryboardRedirect;
