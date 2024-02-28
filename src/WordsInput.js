import React from "react";
import "./WordsInput.css";
import { useStickyState, hasDuplicates } from "./Utils";
import { serializeBoard, initialBoard, currentVersion } from "./Board";

const WordsInput = () => {
  const board = initialBoard();
  const [newBoard, setNewBoard] = useStickyState({ ...board }, "board");

  const handleGroupChange = (color, event) => {
    const updatedBoard = { ...newBoard };
    updatedBoard.groups[color] = event.target.value;
    setNewBoard(updatedBoard);
  };

  const handleWordChange = (rowIndex, wordIndex, event) => {
    const updatedBoard = { ...newBoard };
    updatedBoard.words[rowIndex][wordIndex].text = event.target.value;
    setNewBoard(updatedBoard);
  };

  const clearBoardHandler = () => {
    setNewBoard({ ...board });
  };

  const generateLinkHandler = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/#/play/${currentVersion}/${serializeBoard(newBoard, currentVersion)}`,
    );
  };

  const isBoardValid = () => {
    const keysComplete =
      newBoard.groups.yellow &&
      newBoard.groups.blue &&
      newBoard.groups.purple &&
      newBoard.groups.green;
    const allWords = newBoard.words.flatMap((row) =>
      row.map((word) => word.text),
    );
    const wordsComplete = allWords.every((word) => word !== "");
    const noDuplicateWords = !hasDuplicates(allWords);
    return keysComplete && wordsComplete && noDuplicateWords;
  };

  const groupColors = Object.entries(newBoard.groups).map((group) => group[0]);

  return (
    <div className="words-input-container">
      {groupColors.map((color, groupIndex) => (
        <div key={groupIndex} className={`word-group ${color}-word-group`}>
          <label>
            <input
              type="text"
              placeholder={`${color.charAt(0).toUpperCase() + color.slice(1)} Group Title`}
              value={newBoard.groups[color]}
              onChange={(event) => handleGroupChange(color, event)}
              className="word-input"
            />
          </label>
          {newBoard.words[groupIndex].map((word, wordIndex) => (
            <input
              key={wordIndex}
              type="text"
              placeholder={`Word ${wordIndex + 1}`}
              value={word.text}
              onChange={(event) =>
                handleWordChange(groupIndex, wordIndex, event)
              }
              className="word-input"
            />
          ))}
        </div>
      ))}
      <div className="button-container">
        <button className="clear-button" onClick={() => clearBoardHandler()}>
          Clear Board
        </button>
        {isBoardValid() && (
          <button className="link-button" onClick={() => generateLinkHandler()}>
            Copy Link
          </button>
        )}
      </div>
    </div>
  );
};

export default WordsInput;
