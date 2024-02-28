import React, { useState } from 'react';
import './WordsInput.css';

const WordsInput = ({ board }) => {
  const [tempBoard, setTempBoard] = useState({ ...board });

  const handleTitleChange = (color, event) => {
    const updatedBoard = { ...tempBoard };
    updatedBoard.groups[color] = event.target.value;
    setTempBoard(updatedBoard);
  };

  const handleWordChange = (rowIndex, wordIndex, event) => {
    const updatedBoard = { ...tempBoard };
    updatedBoard.words[rowIndex][wordIndex].text = event.target.value;
    setTempBoard(updatedBoard);
  };

  const generateLinkHandler = () => {
    navigator.clipboard.writeText(`http://localhost:3000/play/${btoa(JSON.stringify(tempBoard))}`)
  }

  const isBoardValid = () => {
    const keysComplete = board.groups.yellow && board.groups.blue && board.groups.purple && board.groups.green
    const wordsComplete = board.words.every(row => row.every(word => word.text !== ''))
    return keysComplete && wordsComplete
  }

  const groupColors = ['yellow', 'green', 'blue', 'purple'];

  return (
    <div className="words-input-container">
      {groupColors.map((color, groupIndex) => (
        <div key={groupIndex} className="word-group">
          <label>
            <input
              type="text"
              placeholder={`${color.charAt(0).toUpperCase() + color.slice(1)} Group Title`}
              value={tempBoard.groups[color]}
              onChange={(event) => handleTitleChange(color, event)}
              className="word-input"
            />
          </label>
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
      {isBoardValid() && (
        <button className="submit-button" onClick={() => generateLinkHandler()}>
          Generate & Copy Link
        </button>
      )}
      <br />
    </div>
  );
};

export default WordsInput;
