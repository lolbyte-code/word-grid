import React, { useState, useEffect } from 'react';
import './WordGrid.css';
import { useParams } from 'react-router-dom';

const WordGrid = ({firstBoard}) => {
  const { boardHash } = useParams();

  const [board, setBoard] = useState({...firstBoard})

  useEffect(() => {
    const list = atob(boardHash).split("|")
    const tempBoard = {...board}
    tempBoard.groups.yellow = list[0]
    tempBoard.groups.green = list[1]
    tempBoard.groups.blue = list[2]
    tempBoard.groups.purple = list[3]

    tempBoard.words[0][0].text = list[4]
    tempBoard.words[0][1].text = list[5]
    tempBoard.words[0][2].text = list[6]
    tempBoard.words[0][3].text = list[7]

    tempBoard.words[1][0].text = list[8]
    tempBoard.words[1][1].text = list[9]
    tempBoard.words[1][2].text = list[10]
    tempBoard.words[1][3].text = list[11]

    tempBoard.words[2][0].text = list[12]
    tempBoard.words[2][1].text = list[13]
    tempBoard.words[2][2].text = list[14]
    tempBoard.words[2][3].text = list[15]

    tempBoard.words[3][0].text = list[16]
    tempBoard.words[3][1].text = list[17]
    tempBoard.words[3][2].text = list[18]
    tempBoard.words[3][3].text = list[19]

    setBoard(tempBoard)
  }, [boardHash])

  const tWords = new Map(Object.entries(board.groups).map(f => [f[0], board.words.filter(w => w[0].group == f[0])[0].map(f => f.text)]))
  const words = board.words.flatMap(f => f.map(e => e.text))
  const [yellowTargetWords, setYellowTargetWords] = useState(tWords.get('yellow').map(w => w.toLowerCase()));
  const [greenTargetWords, setGreenTargetWords] = useState(tWords.get('green').map(w => w.toLowerCase()));
  const [blueTargetWords, setBlueTargetWords] = useState(tWords.get('blue').map(w => w.toLowerCase()));
  const [purpleTargetWords, setPurpleTargetWords] = useState(tWords.get('purple').map(w => w.toLowerCase()));

  useEffect(() => {
    setYellowTargetWords(tWords.get('yellow').map(w => w.toLowerCase()));
    setGreenTargetWords(tWords.get('green').map(w => w.toLowerCase()));
    setBlueTargetWords(tWords.get('blue').map(w => w.toLowerCase()));
    setPurpleTargetWords(tWords.get('purple').map(w => w.toLowerCase()));
    setGrid(generateGrid())
  }, [board]);

  const generateGrid = () => {
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    const grid = [];

    for (let i = 0; i < 4; i++) {
      const row = [];
      for (let j = 0; j < 4; j++) {
        const index = i * 4 + j;
        row.push({ word: shuffledWords[index], selected: false, locked: false });
      }
      grid.push(row);
    }

    return grid;
  };

  const [grid, setGrid] = useState(generateGrid());

  useEffect(() => {
    const selectedWords = grid
      .flat()
      .filter((cell) => cell.selected)
      .map((cell) => cell.word.toLowerCase());

    if (yellowTargetWords.length > 0 && yellowTargetWords.every((target) => selectedWords.includes(target))) {
      const updatedGrid = [...grid]
      updatedGrid.forEach((row, rowIdx) => {
        row.forEach((cell, cellIdx) => {
          const locked = yellowTargetWords.includes(cell.word.toLowerCase())
          updatedGrid[rowIdx][cellIdx] = {...cell, locked: locked, yellowLocked: locked}
        })
      })
      setYellowTargetWords([])
      setGrid(updatedGrid);
    }

    if (greenTargetWords.length > 0 && greenTargetWords.every((target) => selectedWords.includes(target))) {
      const updatedGrid = [...grid]
      updatedGrid.forEach((row, rowIdx) => {
        row.forEach((cell, cellIdx) => {
          const locked = greenTargetWords.includes(cell.word.toLowerCase())
          updatedGrid[rowIdx][cellIdx] = {...cell, locked: locked, greenLocked: locked}
        })
      })
      setGreenTargetWords([])
      setGrid(updatedGrid);
    }

    if (blueTargetWords.length > 0 && blueTargetWords.every((target) => selectedWords.includes(target))) {
      const updatedGrid = [...grid]
      updatedGrid.forEach((row, rowIdx) => {
        row.forEach((cell, cellIdx) => {
          const locked = blueTargetWords.includes(cell.word.toLowerCase())
          updatedGrid[rowIdx][cellIdx] = {...cell, locked: locked, blueLocked: locked}
        })
      })
      setBlueTargetWords([])
      setGrid(updatedGrid);
    }

    if (purpleTargetWords.length > 0 && purpleTargetWords.every((target) => selectedWords.includes(target))) {
      const updatedGrid = [...grid]
      updatedGrid.forEach((row, rowIdx) => {
        row.forEach((cell, cellIdx) => {
          const locked = purpleTargetWords.includes(cell.word.toLowerCase())
          updatedGrid[rowIdx][cellIdx] = {...cell, locked: locked, purpleLocked: locked}
        })
      })
      setPurpleTargetWords([])
      setGrid(updatedGrid);
    }
  }, [grid]);

  const handleWordClick = (rowIndex, columnIndex) => {
    const updatedGrid = [...grid];
    const clickedWord = updatedGrid[rowIndex][columnIndex];

    // Check if the word is already selected
    if (clickedWord.selected) {
      // Deselect the word
      clickedWord.selected = false;
      setGrid(updatedGrid);
    } else {
      // Check if the limit of 4 selected words hasn't been reached
      const selectedCount = updatedGrid.flat().filter((cell) => cell.selected && !cell.locked).length + 1;
      // if (selectedCount <= 4) {
        // Select the word
        clickedWord.selected = true;
        setGrid(updatedGrid);
      // }
    }
  };

  return (
    <div className="word-grid">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="word-row">
          {row.map((cell, columnIndex) => (
            <div
              key={columnIndex}
              className={`word-cell ${cell.selected ? 'selected' : ''}  ${cell.yellowLocked ? 'yellow-locked' : ''}  ${cell.greenLocked ? 'green-locked' : ''}  ${cell.blueLocked ? 'blue-locked' : ''}  ${cell.purpleLocked ? 'purple-locked' : ''}`}
              onClick={() => handleWordClick(rowIndex, columnIndex)}
            >
              {cell.word}
            </div>
          ))}
        </div>
      ))}
      {yellowTargetWords.length === 0 ? <div class='word-cell yellow-locked'>{board.groups.yellow}</div> : null}
      {greenTargetWords.length === 0 ? <div class='word-cell green-locked'>{board.groups.green}</div> : null}
      {blueTargetWords.length === 0 ? <div class='word-cell blue-locked'>{board.groups.blue}</div> : null}
      {purpleTargetWords.length === 0 ? <div class='word-cell purple-locked'>{board.groups.purple}</div> : null}
    </div>
  );
};

export default WordGrid;
