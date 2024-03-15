import WordGrid from "../play/WordGrid";
import WordsInput from "../create/WordsInput";
import WordGridPath from "../play/WordGridPath";
import { Routes, Route, useSearchParams } from "react-router-dom";
import "./App.css";

const App = () => {
  const [searchParams] = useSearchParams();
  const boardHash = searchParams.get("boardHash");
  // v1 was a path param, not a query param
  const version = searchParams.get("version") || "v1";
  const puzzleName = searchParams.get("name");
  const showTitle = searchParams.get("showTitle") === "true" || false;

  return (
    <Routes>
      <Route path="play/v1">
        <Route
          path=":boardHash"
          element={<WordGridPath version={version} puzzleName={puzzleName} />}
        ></Route>
      </Route>
      <Route path="play/">
        <Route
          path=":boardHash"
          element={<WordGridPath version={version} puzzleName={puzzleName} />}
        ></Route>
      </Route>
      <Route
        path="*"
        element={
          boardHash ? (
            <WordGrid
              boardHash={boardHash}
              version={version}
              puzzleName={puzzleName}
              createLink="https://tonys-toy-box.com/"
              showTitle={!!showTitle}
            />
          ) : (
            <WordsInput linkBaseUrl={`${window.location.origin}/`} />
          )
        }
      ></Route>
    </Routes>
  );
};

export default App;
