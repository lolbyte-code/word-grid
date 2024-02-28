import React from "react";
import "./Banner.css";

const Banner = ({ text }) => {
  return (
    <div className="banner-container">
      <div className="banner-text">{text}</div>
    </div>
  );
};

export default Banner;
