import React from "react";
import "./NotFound.css";

const NotFound = () => {
  return (
    <div className="not-found-container">
      <h1 className="not-found-title">Not Found</h1>
      <p className="not-found-text">Failed to load puzzle.</p>
    </div>
  );
};

export default NotFound;
