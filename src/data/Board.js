import {
  serializeBoardV3,
  deserializeBoardV1,
  deserializeBoardV2,
  deserializeBoardV3,
} from "./Serializers";

class Board {
  constructor(groups, words, answers) {
    this.groups = groups;
    this.words = words;
    this.answers = answers;
  }
}

class BoardWords {
  constructor(text, group) {
    this.text = text;
    this.group = group;
  }
}

export const initialBoard = () => {
  const groups = {
    yellow: "",
    green: "",
    blue: "",
    purple: "",
  };
  const answers = {
    yellow: [],
    green: [],
    blue: [],
    purple: [],
  };
  const groupsArray = Object.entries(groups);
  var words = [];

  for (let i = 0; i < groupsArray.length; i++) {
    words[i] = [];
    for (let j = 0; j < groupsArray.length; j++) {
      words[i][j] = new BoardWords("", groupsArray[i][0]);
    }
  }

  return new Board(groups, words, answers);
};

export const serializeBoard = (board, version) => {
  switch (version) {
    case "v3":
      return serializeBoardV3(board);
    default:
      throw new Error("No version provided");
  }
};

export const deserializeBoard = (boardHash, version) => {
  switch (version) {
    case "v1":
      return deserializeBoardV1(boardHash, initialBoard());
    case "v2":
      return deserializeBoardV2(boardHash, initialBoard());
    case "v3":
      return deserializeBoardV3(boardHash, initialBoard());
    default:
      throw new Error("No version provided");
  }
};

export const currentVersion = "v3";
