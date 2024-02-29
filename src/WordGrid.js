import React, { useState, useEffect } from "react";
import "./WordGrid.css";
import { useParams, useSearchParams } from "react-router-dom";
import { deserializeBoard, initialBoard, currentVersion } from "./Board";
import AttemptsRemaining from "./Attempts";
import Banner from "./Banner";
import { setEquals, shareResultsCopyPasta } from "./Utils";

const WordGrid = () => {
  const [searchParams] = useSearchParams();
  const { boardHash } = useParams();
  const [board, setBoard] = useState(initialBoard());
  const colors = Object.entries(board.groups).map((group) => group[0]);

  const [grid, setGrid] = useState(null);
  const [targetWords, setTargetWords] = useState({});
  const [attemptsRemaining, setAttemptsRemaining] = useState(4);
  const [bannerText, setBannerText] = useState("");
  const [bannerContent, setBannerContent] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [solvedColors, setSolvedColors] = useState([]);
  const [moves, setMoves] = useState([]);

  useEffect(() => {
    const newBoard = deserializeBoard(boardHash, currentVersion);
    const words = newBoard.words.flatMap((word) => word.map((w) => w.text));
    const wordColors = newBoard.words.flatMap((word) =>
      word.map((w) => w.group),
    );

    const targetWords = new Map();
    colors.forEach((color) => {
      const colorGroup = Object.entries(newBoard.groups)
        .filter((group) => group[0] === color)
        .map((group) => group[0]);
      const colorWords = newBoard.words
        .flat()
        .filter((w) => w.group === color)
        .map((w) => w.text.toLowerCase());

      targetWords.set(colorGroup[0], colorWords);
    });
    setTargetWords(targetWords);

    const newGrid = [];

    for (let i = 0; i < 4; i++) {
      const row = [];
      for (let j = 0; j < 4; j++) {
        const index = i * 4 + j;
        row.push({
          word: words[index],
          selected: false,
          locked: false,
          color: wordColors[index],
        });
      }
      newGrid.push(row);
    }

    setBoard(newBoard);
    setGrid(newGrid);
  }, [boardHash, colors]);

  const handleWordClick = (rowIndex, columnIndex) => {
    const updatedGrid = [...grid];
    const clickedWord = updatedGrid[rowIndex][columnIndex];

    if (clickedWord.locked) {
      return;
    }

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
    if (selectedCount !== 4) {
      return;
    }
    let colorSolved = false;
    const selectedWords = grid
      .flat()
      .filter((cell) => cell.selected)
      .map((cell) => cell.word.toLowerCase());
    const selectedColors = grid
      .flat()
      .filter((cell) => cell.selected)
      .map((cell) => cell.color);

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
        colorWords.filter((target) => !selectedWords.includes(target))
          .length === 1;
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
        const newSolvedColors = [...solvedColors];
        newSolvedColors.push(color);
        setSolvedColors(newSolvedColors);
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
        const sortedGridFlattened = updatedGrid
          .flat()
          .sort(
            (a, b) =>
              newSolvedColors.indexOf(b.color) -
              newSolvedColors.indexOf(a.color),
          );
        updatedGrid[0] = sortedGridFlattened.slice(0, 4);
        updatedGrid[1] = sortedGridFlattened.slice(4, 8);
        updatedGrid[2] = sortedGridFlattened.slice(8, 12);
        updatedGrid[3] = sortedGridFlattened.slice(12, 16);
        targetWords.set(color, []);
        setGrid(updatedGrid);
      }
    });

    const newMoves = [...moves];
    newMoves.push(selectedColors);
    setMoves(newMoves);

    // Check if game is over / update attempts
    if (!colorSolved) {
      setAttemptsRemaining(attemptsRemaining - 1);
      if (attemptsRemaining === 1) {
        setBannerText("better luck next time...");
        setBannerContent(
          <button
            className="share-button"
            onClick={() => handleShare(newMoves)}
          >
            Share
          </button>,
        );
      }
    } else {
      if (Array.from(targetWords).every((color) => color[1].length === 0)) {
        setBannerText("good job!");
        setBannerContent(
          <button
            className="share-button"
            onClick={() => handleShare(newMoves)}
          >
            Share
          </button>,
        );
      }
    }
  };

  const handleShare = (moves) => {
    navigator.clipboard.writeText(
      shareResultsCopyPasta(moves, searchParams.get("name")),
    );
  };

  if (!grid) {
    return null;
  }

  const SolvedTiles = colors
    .sort((a, b) => solvedColors.indexOf(a) - solvedColors.indexOf(b))
    .map((color) => {
      if (targetWords.get(color).length !== 0) return null;
      return (
        <div key={color} className={`word-cell ${color}-locked answer`}>
          <span>{board.groups[color]}</span>
          <span className="answers">
            {board.words
              .flatMap((word) =>
                word.filter((w) => w.group === color).map((w) => w.text),
              )
              .join(", ")}
          </span>
        </div>
      );
    });

  return (
    <div className="word-grid">
      {bannerText && (
        <Banner text={bannerText} content={bannerContent}></Banner>
      )}
      {SolvedTiles}
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="word-row">
          {row.map((cell, columnIndex) => (
            <div
              key={columnIndex}
              className={`word-cell ${cell.selected ? "selected" : ""}  ${cell.yellowLocked ? "yellow-locked" : ""}  ${cell.greenLocked ? "green-locked" : ""}  ${cell.blueLocked ? "blue-locked" : ""}  ${cell.purpleLocked ? "purple-locked" : ""} option`}
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
      <div className="action-container">
        <AttemptsRemaining attempts={attemptsRemaining} />
        <button className="submit-button" onClick={() => handleSubmit()}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default WordGrid;
