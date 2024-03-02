import React, { useEffect, useState } from "react";
import "./WordsInput.css";
import {
  useStickyState,
  hasDuplicates,
  setEquals,
  randomString,
} from "../utils/Utils";
import { serializeBoard, initialBoard, currentVersion } from "../data/Board";
import CopyToClipboardLink from "./CopyToClipboardLink";
import ValidationErrorList from "./ValidationErrorList";

const WordsInput = () => {
  const board = initialBoard();
  const [newBoard, setNewBoard] = useStickyState({ ...board }, "board");
  const [puzzleName, setPuzzleName] = useStickyState("", "puzzleName");
  const [link, setLink] = useState("");
  const [validations, setValidations] = useState([]);
  const [showValidations, setShowValidations] = useState(false);

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
    setShowValidations(false);
    setLink("");
    setPuzzleName("");
    setNewBoard({ ...board });
  };

  useEffect(() => {
    setLink("");
  }, [newBoard, puzzleName]);

  const generateLinkHandler = () => {
    if (!isBoardValid()) {
      setShowValidations(true);
      return;
    }
    let url = ``;
    try {
      url = `${window.location.origin}/#/play/${serializeBoard(newBoard, currentVersion)}?version=${currentVersion}&name=${encodeURIComponent(puzzleName.trim())}`;
    } catch (error) {
      console.error(error);
    }
    const token = randomString(8);
    let body = {
      url: url,
      domain: `tinyurl.com`,
      alias: `${puzzleName.replace(/[^A-Za-z]/g, "")}-${token}`,
    };
    setLink(url);

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
        setLink(data["data"]["tiny_url"]);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const isBoardValid = () => {
    const groupNameLimit = 30;
    const wordLimit = 15;
    const puzzleNameLimit = 20;
    const keysComplete =
      newBoard.groups.yellow &&
      newBoard.groups.blue &&
      newBoard.groups.purple &&
      newBoard.groups.green;
    const allWords = newBoard.words.flatMap((row) =>
      row.map((word) => word.text),
    );
    const wordsComplete = allWords.every((word) => word !== "");
    const groupsLessThanMax = Object.entries(newBoard.groups).every(
      (group) => group[1].length <= groupNameLimit,
    );
    const wordsLessThanMax = allWords.every((word) => word.length <= wordLimit);
    const noDuplicateWords = !hasDuplicates(allWords);
    const noDuplicateGroups = !hasDuplicates([
      newBoard.groups.yellow,
      newBoard.groups.green,
      newBoard.groups.blue,
      newBoard.groups.purple,
    ]);
    const puzzleNameExists = puzzleName !== "";
    const puzzleNameLessThanMax = puzzleName.length <= puzzleNameLimit;
    const newValidations = [];
    if (!keysComplete) {
      newValidations.push("All groups must be named!");
    }
    if (!wordsComplete) {
      newValidations.push("Words may not be blank!");
    }
    if (!wordsLessThanMax) {
      newValidations.push(`Words cannot exceed ${wordLimit} characters!`);
    }
    if (!groupsLessThanMax) {
      newValidations.push(
        `Group names cannot exceed ${groupNameLimit} characters!`,
      );
    }
    if (wordsComplete && !noDuplicateWords) {
      newValidations.push("Duplicate words not allowed!");
    }
    if (!noDuplicateGroups) {
      newValidations.push("Duplicate group names not allowed!");
    }
    if (!puzzleNameExists) {
      newValidations.push("Puzzle name required!");
    }
    if (!puzzleNameLessThanMax) {
      newValidations.push(
        `Puzzle name cannot exceed ${puzzleNameLimit} characters!`,
      );
    }
    if (!setEquals(new Set(newValidations), new Set(validations))) {
      setValidations(newValidations);
    }
    return (
      keysComplete &&
      wordsComplete &&
      wordsLessThanMax &&
      groupsLessThanMax &&
      noDuplicateWords &&
      noDuplicateGroups &&
      puzzleNameExists &&
      puzzleNameLessThanMax
    );
  };

  const groupColors = Object.entries(newBoard.groups).map((group) => group[0]);

  return (
    <div>
      <div className="input-words-container">
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
      </div>
      <div className="input-button-container">
        {showValidations && <ValidationErrorList errors={validations} />}
        <div className="puzzle-name-container">
          <input
            type="text"
            placeholder="Puzzle Name"
            value={puzzleName}
            onChange={(event) => setPuzzleName(event.target.value)}
            className="word-input puzzle-name-input"
            disabled={!isBoardValid() && validations.length > 1}
          />
        </div>
        <div className="button-container">
          <button className="clear-button" onClick={() => clearBoardHandler()}>
            Clear
          </button>
          <button className="link-button" onClick={() => generateLinkHandler()}>
            Create
          </button>
        </div>
        {isBoardValid() && link && <CopyToClipboardLink link={link} />}
      </div>
    </div>
  );
};

export default WordsInput;
