import React from "react";
import "./Loading.css";

const Loading = ({ 
  type = "default", 
  size = "medium", 
  message = "Chargement...", 
  fullScreen = false,
  color = "primary" 
}) => {
  const getLoadingContent = () => {
    switch (type) {
      case "dots":
        return (
          <div className={`loading-dots loading-${size}`}>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        );
      
      case "pulse":
        return (
          <div className={`loading-pulse loading-${size}`}>
            <div className="pulse-circle"></div>
            <div className="pulse-circle"></div>
            <div className="pulse-circle"></div>
          </div>
        );
      
      case "wave":
        return (
          <div className={`loading-wave loading-${size}`}>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
          </div>
        );
      
      case "orbit":
        return (
          <div className={`loading-orbit loading-${size}`}>
            <div className="orbit-center"></div>
            <div className="orbit-ring">
              <div className="orbit-dot"></div>
            </div>
          </div>
        );
      
      case "gradient":
        return (
          <div className={`loading-gradient loading-${size}`}>
            <div className="gradient-spinner"></div>
          </div>
        );
      
      case "tunisair":
        return (
          <div className={`loading-tunisair loading-${size}`}>
            <div className="tunisair-spinner">
              <div className="plane-icon">✈️</div>
              <div className="flight-path"></div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className={`loading-spinner loading-${size} loading-${color}`}>
            <div className="spinner-ring"></div>
          </div>
        );
    }
  };

  const containerClass = fullScreen 
    ? `loading-container loading-fullscreen loading-${color}` 
    : `loading-container loading-${color}`;

  return (
    <div className={containerClass}>
      <div className="loading-content">
        {getLoadingContent()}
        {message && (
          <div className="loading-message">
            <p>{message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Loading;
