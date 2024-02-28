import WordGrid from "./WordGrid";
import WordsInput from "./WordsInput";
import { Routes, Route } from "react-router-dom";
import { initialBoard } from "./Board";

function App() {
  const board = initialBoard();

  return (
    <Routes>
      <Route path="play">
        <Route
          path=":boardHash"
          element={<WordGrid firstBoard={board} />}
        ></Route>
      </Route>
      <Route
        path="create"
        element={<WordsInput initialBoard={board} />}
      ></Route>
    </Routes>
  );
}

export default App;
