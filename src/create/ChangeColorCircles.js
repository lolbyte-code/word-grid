import React from "react";
import "./ChangeColorCircles.css";

const ChangeColorCircle = ({ source, targets, clickHandler }) => {
  const renderCircles = () => {
    return targets.map((target, idx) => {
      return (
        <div
          key={idx}
          className={`change-color-circle ${target}`}
          onClick={() => clickHandler(source, target)}
        ></div>
      );
    });
  };

  return (
    <div className="change-color-circles-container">{renderCircles()}</div>
  );
};

export default ChangeColorCircle;
