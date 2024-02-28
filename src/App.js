import { useState } from 'react';
import WordGrid from './WordGrid';
import WordsInput from './WordsInput';
import { Routes, Route, useParams } from 'react-router-dom';


function App() {
  const [board, setBoard] = useState({ "groups": { "yellow": "", "green": "", "blue": "", "purple": "" }, "words": [[{ "text": "", "group": "yellow" }, { "text": "", "group": "yellow" }, { "text": "", "group": "yellow" }, { "text": "", "group": "yellow" }], [{ "text": "", "group": "green" }, { "text": "", "group": "green" }, { "text": "", "group": "green" }, { "text": "", "group": "green" }], [{ "text": "", "group": "blue" }, { "text": "", "group": "blue" }, { "text": "", "group": "blue" }, { "text": "", "group": "blue" }], [{ "text": "", "group": "purple" }, { "text": "", "group": "purple" }, { "text": "", "group": "purple" }, { "text": "", "group": "purple" }]] }
  );

  return (
    <Routes>
      <Route path="play">
        <Route path=":boardHash" element={<WordGrid firstBoard={board} />}></Route>
      </Route>
      <Route path="create" element={<WordsInput board={board} />}></Route>
    </Routes>
  );
}

export default App;
