import React, { useState } from "react";
import Loading from "../Loading";
import "./LoadingDemo.css";

const LoadingDemo = () => {
  const [selectedType, setSelectedType] = useState("default");
  const [selectedSize, setSelectedSize] = useState("medium");
  const [selectedColor, setSelectedColor] = useState("primary");
  const [showFullScreen, setShowFullScreen] = useState(false);

  const loadingTypes = [
    { value: "default", label: "Default Spinner" },
    { value: "dots", label: "Bouncing Dots" },
    { value: "pulse", label: "Pulse Circles" },
    { value: "wave", label: "Wave Bars" },
    { value: "orbit", label: "Orbit Animation" },
    { value: "gradient", label: "Gradient Spinner" },
    { value: "tunisair", label: "Tunisair Plane" },
  ];

  const sizes = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
    { value: "xl", label: "Extra Large" },
  ];

  const colors = [
    { value: "primary", label: "Primary Blue" },
    { value: "secondary", label: "Secondary Gray" },
    { value: "success", label: "Success Green" },
    { value: "warning", label: "Warning Yellow" },
    { value: "danger", label: "Danger Red" },
    { value: "white", label: "White" },
  ];

  return (
    <div className="loading-demo">
      <div className="demo-header">
        <h1>🎨 Loading Component Showcase</h1>
        <p>Beautiful, modern, and dynamic loading animations for your application</p>
      </div>

      <div className="demo-controls">
        <div className="control-group">
          <label>Animation Type:</label>
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
            className="demo-select"
          >
            {loadingTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Size:</label>
          <select 
            value={selectedSize} 
            onChange={(e) => setSelectedSize(e.target.value)}
            className="demo-select"
          >
            {sizes.map(size => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Color:</label>
          <select 
            value={selectedColor} 
            onChange={(e) => setSelectedColor(e.target.value)}
            className="demo-select"
          >
            {colors.map(color => (
              <option key={color.value} value={color.value}>
                {color.label}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <button 
            onClick={() => setShowFullScreen(true)}
            className="demo-button"
          >
            Show Full Screen
          </button>
        </div>
      </div>

      <div className="demo-preview">
        <h3>Preview:</h3>
        <div className="preview-container">
          <Loading 
            type={selectedType}
            size={selectedSize}
            color={selectedColor}
            message={`Loading with ${selectedType} animation...`}
          />
        </div>
      </div>

      <div className="demo-gallery">
        <h3>All Animation Types:</h3>
        <div className="gallery-grid">
          {loadingTypes.map(type => (
            <div key={type.value} className="gallery-item">
              <h4>{type.label}</h4>
              <div className="gallery-preview">
                <Loading 
                  type={type.value}
                  size="medium"
                  color="primary"
                  message={type.label}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="demo-colors">
        <h3>Color Variants:</h3>
        <div className="colors-grid">
          {colors.map(color => (
            <div key={color.value} className="color-item">
              <h4>{color.label}</h4>
              <div className="color-preview">
                <Loading 
                  type="default"
                  size="medium"
                  color={color.value}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="demo-usage">
        <h3>Usage Examples:</h3>
        <div className="usage-code">
          <pre>{`// Basic usage
<Loading />

// Custom animation
<Loading type="tunisair" size="large" color="primary" />

// Full screen loading
<Loading 
  type="gradient" 
  size="xl" 
  message="Loading your data..." 
  fullScreen={true}
  color="primary"
/>

// Button loading
<Loading type="dots" size="small" color="white" />`}</pre>
        </div>
      </div>

      {showFullScreen && (
        <div className="fullscreen-demo">
          <Loading 
            type={selectedType}
            size="xl"
            color={selectedColor}
            message="Full Screen Loading Demo"
            fullScreen={true}
          />
          <button 
            onClick={() => setShowFullScreen(false)}
            className="close-fullscreen"
          >
            ✕ Close
          </button>
        </div>
      )}
    </div>
  );
};

export default LoadingDemo;
