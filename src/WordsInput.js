import React from 'react';
import { useState } from 'react';
import './WordsInput.css';

const WordsInput = ({ board, setBoard }) => {
  const [tempBoard, setTempBoard] = useState({ ...board });

  const handleTitleChange = (color, event) => {
    setTempBoard((prevBoard) => ({
      ...prevBoard,
      groups: {
        ...prevBoard.groups,
        [color]: event.target.value,
      },
    }));
  };

  const handleWordChange = (rowIndex, wordIndex, event) => {
    const updatedBoard = { ...tempBoard };
    updatedBoard.words[rowIndex][wordIndex].text = event.target.value;
    setTempBoard(updatedBoard);
  };

  const groupColors = ['yellow', 'green', 'blue', 'purple'];

  return (
    <div className="words-input-container">
      {groupColors.map((color, groupIndex) => (
        <div key={groupIndex} className="word-group">
          <input
            type="text"
            placeholder={`${color.charAt(0).toUpperCase() + color.slice(1)} Group Title`}
            value={tempBoard.groups[color]}
            onChange={(event) => handleTitleChange(color, event)}
            className="group-title"
          />
          {tempBoard.words[groupIndex].map((word, wordIndex) => (
            <input
              key={wordIndex}
              type="text"
              placeholder={`Word ${wordIndex + 1}`}
              value={word.text}
              onChange={(event) => handleWordChange(groupIndex, wordIndex, event)}
              className="word-input"
            />
          ))}
        </div>
      ))}
      <button className="submit-button" onClick={() => setBoard(tempBoard)}>
        Submit
      </button>
    </div>
  );
};

export default WordsInput;
