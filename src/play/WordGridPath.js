import WordGrid from "./WordGrid";
import { useParams } from "react-router-dom";

const WordGridPath = ({ puzzleName, version }) => {
  const { boardHash } = useParams();

  return (
    <WordGrid
      boardHash={boardHash}
      version={version}
      puzzleName={puzzleName}
      createLink="https://tonys-toy-box.com/"
    />
  );
};

export default WordGridPath;
