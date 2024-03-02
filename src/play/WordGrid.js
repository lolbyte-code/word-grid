import React, { useState, useEffect } from "react";
import "./WordGrid.css";
import { useParams, useSearchParams } from "react-router-dom";
import { deserializeBoard, initialBoard } from "../data/Board";
import AttemptsRemaining from "./Attempts";
import Banner from "./Banner";
import { setEquals, shareResultsCopyPasta } from "../utils/Utils";
import NotFound from "../common/NotFound";

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
  const [allowBannerInteraction, setAllowBannerInteraction] = useState(false);
  const [guesses, setGuesses] = useState([]);
  const [solvedColors, setSolvedColors] = useState([]);
  const [moves, setMoves] = useState([]);
  const [lost, setLost] = useState(false);
  const [won, setWon] = useState(false);
  const [replaceSubmitWithShare, setReplaceSubmitWithShare] = useState(false);
  const [showShareMessage, setShowShareMessage] = useState(false);
  const [boardHashInvalid, setBoardHashInvalid] = useState(false);

  useEffect(() => {
    let newBoard;
    try {
      newBoard = deserializeBoard(
        boardHash,
        // v1 was a path param, not a query param
        searchParams.get("version") || "v1",
      );
    } catch (error) {
      console.error(`Failed to load board: ${error}`);
      setBoardHashInvalid(true);
      return;
    }
    const words = newBoard.words.flatMap((word) => word.map((w) => w.text));
    const wordColors = newBoard.words.flatMap((word) =>
      word.map((w) => w.group),
    );

    const newTargetWords = new Map();
    colors.forEach((color) => {
      const colorGroup = Object.entries(newBoard.groups)
        .filter((group) => group[0] === color)
        .map((group) => group[0]);
      const colorWords = newBoard.words
        .flat()
        .filter((w) => w.group === color)
        .map((w) => w.text.toLowerCase());

      newTargetWords.set(colorGroup[0], colorWords);
    });
    setTargetWords(newTargetWords);

    const newGrid = [];

    for (let i = 0; i < 4; i++) {
      const row = [];
      for (let j = 0; j < 4; j++) {
        const index = i * 4 + j;
        row.push({
          word: words[index],
          selected: false,
          color: wordColors[index],
        });
      }
      newGrid.push(row);
    }

    setBoard(newBoard);
    setGrid(newGrid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardHash]);

  const handleWordClick = (rowIndex, columnIndex) => {
    if (lost) return;
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
    if (lost) return;
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
        setAllowBannerInteraction(false);
      }, "1000");
      setBannerText("already guessed!");
      setAllowBannerInteraction(true);
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
          if (attemptsRemaining > 1) setBannerText("");
          setAllowBannerInteraction(false);
        }, "1000");
        setBannerText("one away...");
        setAllowBannerInteraction(true);
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
            updatedGrid[rowIdx][cellIdx] = {
              ...cell,
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
        updatedGrid[0] = [];
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
      if (attemptsRemaining <= 1) {
        setLost(true);
      }
    } else {
      if (Array.from(targetWords).every((color) => color[1].length === 0)) {
        setWon(true);
      }
    }
  };

  useEffect(() => {
    if (!lost || replaceSubmitWithShare) return;
    setBannerText("better luck next time...");
    setBannerContent(
      <div className="loss-buttons">
        <button className="end-game-button" onClick={() => handleShare()}>
          Share
        </button>
        {showShareMessage && <p className="copy-text">Copied to clipboard!</p>}
        <button className="end-game-button" onClick={() => handleTryAgain()}>
          Try Again
        </button>
        <button className="end-game-button" onClick={() => handleReveal()}>
          Reveal
        </button>
      </div>,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lost, showShareMessage]);

  useEffect(() => {
    if (!won) return;
    setTimeout(() => {
      setBannerText("");
    }, "1000");
    setBannerText("good job!");
    setReplaceSubmitWithShare(true);
  }, [won]);

  const handleShare = () => {
    navigator.clipboard.writeText(
      shareResultsCopyPasta(moves, searchParams.get("name")),
    );
    setTimeout(() => {
      setShowShareMessage(false);
    }, "1000");
    setShowShareMessage(true);
  };

  const handleTryAgain = () => {
    window.location.reload();
  };

  const handleReveal = () => {
    const unsolvedColors = colors.filter(
      (color) => solvedColors.indexOf(color) === -1,
    );
    unsolvedColors.forEach((color) => {
      targetWords.set(color, []);
    });
    setSolvedColors(solvedColors.concat(unsolvedColors));
    setGrid([]);
    setBannerText("");
    setReplaceSubmitWithShare(true);
  };

  if (boardHashInvalid) {
    return <NotFound />;
  }

  if (!grid) {
    return null;
  }

  const SolvedTiles = colors
    .sort((a, b) => solvedColors.indexOf(a) - solvedColors.indexOf(b))
    .map((color) => {
      if (targetWords.get(color).length !== 0) return null;
      const answer = board.answers[color]
        .map((answer) => answer.trim())
        .join(", ");
      return (
        <div key={color} className={`word-cell ${color}-answer answer-cell`}>
          <span>{board.groups[color]}</span>
          <span className="answers">{answer}</span>
        </div>
      );
    });

  return (
    <div className="word-grid-container">
      {bannerText && (
        <Banner
          text={bannerText}
          content={bannerContent}
          allowInteraction={allowBannerInteraction}
        ></Banner>
      )}
      {SolvedTiles}
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="word-row">
          {row.map((cell, columnIndex) => (
            <div
              key={columnIndex}
              className={`word-cell${cell.selected ? " selected" : ""}`}
              onClick={() => handleWordClick(rowIndex, columnIndex)}
            >
              <span>{cell.word}</span>
            </div>
          ))}
        </div>
      ))}
      <div className="submit-container">
        <AttemptsRemaining attempts={attemptsRemaining} />
        <button
          className="submit-button"
          onClick={() =>
            replaceSubmitWithShare ? handleShare() : handleSubmit()
          }
        >
          {replaceSubmitWithShare ? "Share" : "Submit"}
        </button>
        {replaceSubmitWithShare && showShareMessage && (
          <p className="copy-text">Copied to clipboard!</p>
        )}
      </div>
    </div>
  );
};

export default WordGrid;
