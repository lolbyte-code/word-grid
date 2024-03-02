import WordGrid from "../play/WordGrid";
import WordsInput from "../create/WordsInput";
import { Routes, Route } from "react-router-dom";
import "./App.css";

const App = () => {
  return (
    <Routes>
      <Route path="play/v1">
        <Route path=":boardHash" element={<WordGrid />}></Route>
      </Route>
      <Route path="play/">
        <Route path=":boardHash" element={<WordGrid />}></Route>
      </Route>
      <Route path="*" element={<WordsInput />}></Route>
    </Routes>
  );
};

export default App;
