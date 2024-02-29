import React from "react";
import "./Banner.css";

const Banner = ({ text, content }) => {
  return (
    <div className="banner-container">
      <div className="banner-text">
        {text}
        {content && <div className="banner-content">{content}</div>}
      </div>
    </div>
  );
};

export default Banner;
