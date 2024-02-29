import React from "react";
import "./ValidationErrorList.css";

const ValidationErrorList = ({ errors }) => {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div className="validation-error-list">
      <h3>Errors:</h3>
      <ul>
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  );
};

export default ValidationErrorList;
