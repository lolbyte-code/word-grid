import React, { useState, useEffect } from "react";
import "./WordGrid.css";
import { useParams } from "react-router-dom";
import { deserializeBoard, initialBoard, currentVersion } from "./Board";
import AttemptsRemaining from "./Attempts";
import Banner from "./Banner";
import { setEquals } from "./Utils";

const WordGrid = () => {
  const { boardHash } = useParams();
  const [board, setBoard] = useState(initialBoard());
  const colors = Object.entries(board.groups).map((group) => group[0]);

  const [grid, setGrid] = useState(null);
  const [targetWords, setTargetWords] = useState({});
  const [attemptsRemaining, setAttemptsRemaining] = useState(4);
  const [bannerText, setBannerText] = useState("");
  const [guesses, setGuesses] = useState([]);

  useEffect(() => {
    const newBoard = deserializeBoard(boardHash, currentVersion);
    const words = newBoard.words.flatMap((word) => word.map((w) => w.text));

    const targetWords = new Map(
      Object.entries(newBoard.groups).map((group) => [
        group[0],
        newBoard.words
          .filter((word) => word[0].group == group[0])[0]
          .map((word) => word.text),
      ]),
    );
    setTargetWords(targetWords);

    const newGrid = [];
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);

    for (let i = 0; i < 4; i++) {
      const row = [];
      for (let j = 0; j < 4; j++) {
        const index = i * 4 + j;
        row.push({
          word: shuffledWords[index],
          selected: false,
          locked: false,
        });
      }
      newGrid.push(row);
    }

    setBoard(newBoard);
    setGrid(newGrid);
  }, [boardHash]);

  const handleWordClick = (rowIndex, columnIndex) => {
    const updatedGrid = [...grid];
    const clickedWord = updatedGrid[rowIndex][columnIndex];

    if (clickedWord.selected) {
      clickedWord.selected = false;
      setGrid(updatedGrid);
    } else {
      const selectedCount = updatedGrid
        .flat()
        .filter((cell) => cell.selected).length;
      if (selectedCount < 4) {
        clickedWord.selected = true;
        setGrid(updatedGrid);
      }
    }
  };

  const handleSubmit = () => {
    const selectedCount = grid.flat().filter((cell) => cell.selected).length;
    if (selectedCount != 4) {
      return;
    }
    let colorSolved = false;
    const selectedWords = grid
      .flat()
      .filter((cell) => cell.selected)
      .map((cell) => cell.word.toLowerCase());

    // Check if already guessed
    const selectedWordsSet = new Set(selectedWords);
    if (guesses.some((guess) => setEquals(guess, selectedWordsSet))) {
      setTimeout(() => {
        setBannerText("");
      }, "1000");
      setBannerText("already guessed!");
      return;
    } else {
      const newGuesses = [...guesses];
      newGuesses.push(selectedWordsSet);
      setGuesses(newGuesses);
    }

    // Check for one away
    colors.forEach((color) => {
      const colorWords = targetWords.get(color);
      const oneAway =
        colorWords.length > 0 &&
        colorWords.filter((target) => !selectedWords.includes(target)).length ==
          1;
      if (oneAway) {
        setTimeout(() => {
          setBannerText("");
        }, "1000");
        setBannerText("one away...");
      }
    });

    // Check for solves
    colors.forEach((color) => {
      const colorWords = targetWords.get(color);
      if (
        colorWords.length > 0 &&
        colorWords.every((target) => selectedWords.includes(target))
      ) {
        colorSolved = true;
        const updatedGrid = [...grid];
        updatedGrid.forEach((row, rowIdx) => {
          row.forEach((cell, cellIdx) => {
            const locked = colorWords.includes(cell.word.toLowerCase());
            updatedGrid[rowIdx][cellIdx] = {
              ...cell,
              locked: locked,
              [`${color}Locked`]: locked,
              selected: false,
            };
          });
        });
        targetWords.set(color, []);
        setGrid(updatedGrid);
      }
    });

    // Check if game is over / update attempts
    if (!colorSolved) {
      setAttemptsRemaining(attemptsRemaining - 1);
      if (attemptsRemaining == 1) {
        setBannerText("better luck next time...");
      }
    } else {
      if (Array.from(targetWords).every((color) => color[1].length === 0)) {
        setBannerText("good job!");
      }
    }
  };

  if (!grid) {
    return null;
  }

  return (
    <div className="word-grid">
      {bannerText && <Banner text={bannerText}></Banner>}
      {targetWords.get("yellow").length === 0 && (
        <div className="word-cell yellow-locked answer">
          {board.groups.yellow}
        </div>
      )}
      {targetWords.get("green").length === 0 && (
        <div className="word-cell green-locked answer">
          {board.groups.green}
        </div>
      )}
      {targetWords.get("blue").length === 0 && (
        <div className="word-cell blue-locked answer">{board.groups.blue}</div>
      )}
      {targetWords.get("purple").length === 0 && (
        <div className="word-cell purple-locked answer">
          {board.groups.purple}
        </div>
      )}
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="word-row">
          {row.map((cell, columnIndex) => (
            <div
              key={columnIndex}
              className={`word-cell ${cell.selected ? "selected" : ""}  ${cell.yellowLocked ? "yellow-locked" : ""}  ${cell.greenLocked ? "green-locked" : ""}  ${cell.blueLocked ? "blue-locked" : ""}  ${cell.purpleLocked ? "purple-locked" : ""}`}
              onClick={() => handleWordClick(rowIndex, columnIndex)}
            >
              {cell.word.split(" ").map((wordPart, index) => (
                <span key={index}>
                  {wordPart}
                  {index < cell.word.split(" ").length - 1 && <br />}{" "}
                </span>
              ))}
            </div>
          ))}
        </div>
      ))}
      <div className="button-container">
        <AttemptsRemaining attempts={attemptsRemaining} />
        <button className="submit-button" onClick={() => handleSubmit()}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default WordGrid;
