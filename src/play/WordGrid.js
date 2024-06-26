import React, { useState, useEffect } from "react";
import "./WordGrid.css";
import { deserializeBoard, initialBoard } from "../data/Board";
import AttemptsRemaining from "./Attempts";
import Banner from "./Banner";
import { setEquals, shareResultsCopyPasta } from "../utils/Utils";
import NotFound from "../common/NotFound";
import copy from "clipboard-copy";

const WordGrid = ({
  boardHash,
  puzzleName,
  version,
  createLink,
  showTitle,
}) => {
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
  const [hidePlayButtons, setHidePlayButtons] = useState(false);
  const [showShareMessage, setShowShareMessage] = useState(false);
  const [boardHashInvalid, setBoardHashInvalid] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [deselectDisabled, setDeselectDisabled] = useState(false);

  useEffect(() => {
    let newBoard;
    try {
      newBoard = deserializeBoard(boardHash, version);
    } catch (error) {
      console.error(error);
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
    if (!lost || hidePlayButtons) return;
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
  }, [lost, showShareMessage, bannerText]);

  useEffect(() => {
    if (!won) return;
    setTimeout(() => {
      setBannerText("");
    }, "1000");
    setBannerText("good job!");
    setHidePlayButtons(true);
  }, [won]);

  const handleShare = async () => {
    const copyPasta = shareResultsCopyPasta(moves, puzzleName);
    if (navigator.share) {
      navigator
        .share({
          title: puzzleName,
          text: copyPasta,
        })
        .catch((error) => console.error(error));
    } else {
      try {
        await copy(copyPasta);
        setTimeout(() => {
          setShowShareMessage(false);
        }, "1000");
        setShowShareMessage(true);
      } catch (error) {
        console.error("Error copying to clipboard:", error);
      }
    }
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
    setHidePlayButtons(true);
  };

  const handleShuffle = () => {
    const sortedGridFlattened = grid.flat().sort(() => Math.random() - 0.5);
    const result = [];
    for (let i = 0; i < 4; i++) {
      const row = [];
      for (let j = 0; j < 4; j++) {
        if (sortedGridFlattened[i * 4 + j]) {
          row.push(sortedGridFlattened[i * 4 + j]);
        }
      }
      result.push(row);
    }
    setGrid(result);
  };

  const handleDeselect = () => {
    const result = [];
    for (let i = 0; i < 4; i++) {
      const row = grid[i];
      for (let j = 0; j < 4; j++) {
        if (row[j]) {
          row[j].selected = false;
        }
      }
      result.push(row);
    }
    setGrid(result);
  };

  useEffect(() => {
    if (!grid) return;
    const selectedCount = grid.flat().filter((cell) => cell.selected).length;
    if (selectedCount < 4) {
      setSubmitDisabled(true);
    } else {
      setSubmitDisabled(false);
    }
    if (selectedCount === 0) {
      setDeselectDisabled(true);
    } else {
      setDeselectDisabled(false);
    }
  }, [grid]);

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
        <div key={color} className={`${color}-answer answer-cell`}>
          <span>{board.groups[color]}</span>
          <span className="answers">{answer}</span>
        </div>
      );
    });

  const getFontSize = (length) => {
    switch (length) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
        return "min(3.6vw, 20px)";
      case 10:
        return "min(3.3vw, 19px)";
      case 11:
        return "min(3.0vw, 18px)";
      case 12:
        return "min(2.7vw, 17px)";
      case 13:
        return "min(2.5vw, 16px)";
      case 14:
        return "min(2.3vw, 15px)";
      default:
        return "min(2.2vw, 14px)";
    }
  };

  return (
    <div className="word-grid-container">
      {showTitle && <h2 className="puzzleNameHeader">{puzzleName}</h2>}
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
              <span style={{ fontSize: getFontSize(cell.word.length) }}>
                {cell.word}
              </span>
            </div>
          ))}
        </div>
      ))}
      <div className="play-container">
        <AttemptsRemaining attempts={attemptsRemaining} />
        <div className="play-buttons-container">
          {!hidePlayButtons && !lost && (
            <button className="shuffle-button" onClick={() => handleShuffle()}>
              Shuffle
            </button>
          )}
          {!hidePlayButtons && !lost && (
            <button
              className={`deselect-button${deselectDisabled ? " disabled" : ""}`}
              onClick={() => handleDeselect()}
            >
              Clear
            </button>
          )}
          {!hidePlayButtons && !lost && (
            <button
              className={`submit-button${submitDisabled ? " disabled" : ""}`}
              onClick={() => handleSubmit()}
            >
              Submit
            </button>
          )}
          {hidePlayButtons && (
            <button className="share-button" onClick={() => handleShare()}>
              Share
            </button>
          )}
          {(won || lost) && (
            <button className="create-your-own-button">
              <a
                className="hide-link"
                rel="noreferrer"
                target="_blank"
                href={createLink}
              >
                Create Your Own!
              </a>
            </button>
          )}
        </div>
        {hidePlayButtons && showShareMessage && (
          <p className="copy-text">Copied to clipboard!</p>
        )}
      </div>
    </div>
  );
};

export default WordGrid;
