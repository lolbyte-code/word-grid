import React from "react";
import "./Attempts.css";

const AttemptsRemaining = ({ attempts }) => {
  const renderCircles = () => {
    const circles = [];

    for (let i = 0; i < attempts; i++) {
      circles.push(<div key={i} className="circle"></div>);
    }

    return circles;
  };

  return <div className="attempts-remaining">{renderCircles()}</div>;
};

export default AttemptsRemaining;
