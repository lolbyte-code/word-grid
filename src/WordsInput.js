import React from "react";
import "./WordsInput.css";
import { useStickyState } from "./Utils";

const WordsInput = ({ initialBoard }) => {
  const [newBoard, setNewBoard] = useStickyState({ ...initialBoard }, "board");

  const handleTitleChange = (color, event) => {
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
    setNewBoard({ ...initialBoard });
  };

  const generateLinkHandler = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/word-grid/#/play/${serializeBoard()}`,
    );
  };

  const isBoardValid = () => {
    const keysComplete =
      newBoard.groups.yellow &&
      newBoard.groups.blue &&
      newBoard.groups.purple &&
      newBoard.groups.green;
    const wordsComplete = newBoard.words.every((row) =>
      row.every((word) => word.text !== ""),
    );
    return keysComplete && wordsComplete;
  };

  const groupColors = ["yellow", "green", "blue", "purple"];

  const serializeBoard = () => {
    return btoa(
      encodeURIComponent(
        `${Object.values(newBoard.groups).join("|")}|${newBoard.words
          .flatMap((b) => b.map((c) => c.text))
          .join("|")}`,
      ),
    );
  };

  return (
    <div className="words-input-container">
      {groupColors.map((color, groupIndex) => (
        <div key={groupIndex} className={`word-group ${color}-word-group`}>
          <label>
            <input
              type="text"
              placeholder={`${color.charAt(0).toUpperCase() + color.slice(1)} Group Title`}
              value={newBoard.groups[color]}
              onChange={(event) => handleTitleChange(color, event)}
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
