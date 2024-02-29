import React from "react";
import "./WordsInput.css";
import { useStickyState, hasDuplicates } from "./Utils";
import { serializeBoard, initialBoard, currentVersion } from "./Board";

const WordsInput = () => {
  const board = initialBoard();
  const [newBoard, setNewBoard] = useStickyState({ ...board }, "board");
  const [puzzleName, setPuzzleName] = useStickyState("", "puzzleName");

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

  const generateLinkHandler = (puzzleName) => {
    const url = `${window.location.origin}/#/play/${currentVersion}/${serializeBoard(newBoard, currentVersion)}?name=${encodeURIComponent(puzzleName)}`;
    let body = {
      url: url,
      domain: `tiny.one`,
    };
    navigator.clipboard.writeText(url);

    let responseData = "";

    fetch(`https://api.tinyurl.com/create`, {
      method: `POST`,
      headers: {
        accept: `application/json`,
        authorization: `Bearer 2nLQGpsuegHP8l8J0Uq1TsVkCzP3un3T23uQ5YovVf5lvvGOucGmFOYRVj6L`,
        "content-type": `application/json`,
      },
      body: JSON.stringify(body),
    })
      .then((response) => {
        if (response.status !== 200)
          throw new Error(
            `There was a problem with the fetch operation. Status Code: ${response.status}`,
          );
        return response.json();
      })
      .then((data) => {
        responseData = data;
      })
      .catch((error) => {
        console.error(error);
      });
    setTimeout(() => {
      navigator.clipboard.writeText(responseData["data"]["tiny_url"]);
    }, 1000);
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
    const noDuplicateGroups = !hasDuplicates([
      newBoard.groups.yellow,
      newBoard.groups.green,
      newBoard.groups.blue,
      newBoard.groups.purple,
    ]);
    return (
      keysComplete && wordsComplete && noDuplicateWords && noDuplicateGroups
    );
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
      {isBoardValid() && (
        <label>
          <input
            type="text"
            placeholder="Puzzle Name"
            value={puzzleName}
            onChange={(event) => setPuzzleName(event.target.value)}
            className="word-input"
          />
        </label>
      )}
      <div className="button-container">
        <button className="clear-button" onClick={() => clearBoardHandler()}>
          Clear Board
        </button>
        {isBoardValid() && puzzleName !== "" && (
          <button
            className="link-button"
            onClick={() => generateLinkHandler(puzzleName)}
          >
            Copy Link
          </button>
        )}
      </div>
    </div>
  );
};

export default WordsInput;
