import { useState } from 'react';
import WordGrid from './WordGrid';
import WordsInput from './WordsInput';

function App() {
  const [board, setBoard] = useState({ "groups": { "yellow": "", "green": "", "blue": "", "purple": "" }, "words": [[{ "text": "", "group": "yellow" }, { "text": "", "group": "yellow" }, { "text": "", "group": "yellow" }, { "text": "", "group": "yellow" }], [{ "text": "", "group": "green" }, { "text": "", "group": "green" }, { "text": "", "group": "green" }, { "text": "", "group": "green" }], [{ "text": "", "group": "blue" }, { "text": "", "group": "blue" }, { "text": "", "group": "blue" }, { "text": "", "group": "blue" }], [{ "text": "", "group": "purple" }, { "text": "", "group": "purple" }, { "text": "", "group": "purple" }, { "text": "", "group": "purple" }]] }
  );
  const setBoardHandler = (board) => {
    setBoard(board)
  }

  return (
    <div className="App">
      <WordGrid board={board} />
      <WordsInput board={board} setBoard={setBoardHandler} />
    </div>
  );
}

export default App;
