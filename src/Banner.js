import React from "react";
import "./Banner.css";

const Banner = ({ text, content }) => {
  return (
    <div className="banner-container">
      <div className="banner-text">{text}</div>
      <div>{content}</div>
    </div>
  );
};

export default Banner;
