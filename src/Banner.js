import React from "react";
import "./Banner.css";

const Banner = ({ text, content, allowInteraction }) => {
  return (
    <div
      className={`banner-container ${allowInteraction ? "banner-allow-interaction" : ""}`}
    >
      <div className="banner-text">
        {text}
        {content && <div className="banner-content">{content}</div>}
      </div>
    </div>
  );
};

export default Banner;
