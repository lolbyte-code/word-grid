import React from "react";
import { useState, useRef, useEffect } from "react";
import "./WordCell.css";

const WordCell = ({ selected, onClick, word }) => {
  const [fontSize, setFontSize] = useState(18);
  const textRef = useRef(null);

  useEffect(() => {
    const textElement = textRef.current;
    const containerWidth = textElement.parentElement.offsetWidth - 10;

    const checkOverflow = () => {
      if (textElement.offsetWidth > containerWidth) {
        setFontSize((prevFontSize) => prevFontSize - 1);
      }
    };

    checkOverflow();

    const handleResize = () => {
      setFontSize(18);
      checkOverflow();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [word, fontSize]);

  return (
    <div
      className={`word-cell${selected ? " selected" : ""}`}
      onClick={onClick}
    >
      <span ref={textRef} style={{ fontSize }}>
        {word}
      </span>
    </div>
  );
};

export default WordCell;
