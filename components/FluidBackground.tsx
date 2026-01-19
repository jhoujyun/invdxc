
import React from 'react';

const FluidBackground: React.FC = () => {
  return (
    <div className="ink-wash-bg">
      <style>
        {`
          @keyframes breathe {
            0%, 100% { transform: scale(1) translate(0, 0); filter: blur(100px); opacity: 0.6; }
            50% { transform: scale(1.15) translate(2%, 2%); filter: blur(140px); opacity: 0.4; }
          }
          @keyframes breathe-alt {
            0%, 100% { transform: scale(1.1) translate(0, 0); filter: blur(120px); opacity: 0.5; }
            50% { transform: scale(1.25) translate(-3%, 1%); filter: blur(160px); opacity: 0.3; }
          }
          .breathing-blob {
            animation: breathe 12s infinite ease-in-out;
          }
          .breathing-blob-alt {
            animation: breathe-alt 15s infinite ease-in-out;
          }
        `}
      </style>
      {/* Calm Colorful Blobs */}
      <div className="blob breathing-blob w-[700px] h-[700px] bg-emerald-100/60 top-[-10%] left-[-10%] blur-[120px]" />
      <div className="blob breathing-blob w-[600px] h-[600px] bg-indigo-100/50 bottom-[-15%] right-[-5%] blur-[140px]" style={{ animationDelay: '3s' }} />
      <div className="blob breathing-blob w-[500px] h-[500px] bg-rose-50/60 top-[20%] left-[30%] blur-[100px]" style={{ animationDelay: '6s' }} />
      <div className="blob breathing-blob w-[800px] h-[800px] bg-teal-50/50 top-[5%] right-[15%] blur-[160px]" style={{ animationDelay: '9s' }} />
      
      {/* New Ink Wash Element: Lavender/Blue Tone */}
      <div 
        className="blob breathing-blob-alt w-[650px] h-[650px] bg-violet-100/50 bottom-[10%] left-[10%] blur-[150px]" 
        style={{ animationDelay: '4.5s' }} 
      />
    </div>
  );
};

export default FluidBackground;
