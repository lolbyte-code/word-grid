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
    case "v1":
      return serializeBoardV1(board);
    case "v2":
      return serializeBoardV2(board);
    default:
      throw new Error("No version provided");
  }
};

const serializeBoardV1 = (board) => {
  return btoa(
    encodeURIComponent(
      `${Object.values(board.groups).join("|")}|${board.words
        .flatMap((b) => b.map((c) => c.text))
        .join("|")}|${board.words
        .flatMap((b) => b.map((c) => c.text))
        .sort(() => Math.random() - 0.5)
        .join("|")}`,
    ),
  );
};

const sortOrderString = "ABCDEFGHIJKLMNOP";
const nonBase64Delimiter = "-";

const serializeBoardV2 = (board) => {
  const sortOrder = [...sortOrderString]
    .sort(() => Math.random() - 0.5)
    .join("");
  return `${Object.values(board.groups)
    .map((group) => encodeURIComponent(btoa(group)))
    .join(nonBase64Delimiter)}${nonBase64Delimiter}${board.words
    .flatMap((b) => b.map((c) => encodeURIComponent(btoa(c.text))))
    .join(nonBase64Delimiter)}${sortOrder}`;
};

export const deserializeBoard = (boardHash, version) => {
  switch (version) {
    case "v1":
      return deserializeBoardV1(boardHash);
    case "v2":
      return deserializeBoardV2(boardHash);
    default:
      throw new Error("No version provided");
  }
};

export const deserializeBoardV1 = (boardHash) => {
  const colors = ["yellow", "green", "blue", "purple"];
  const list = decodeURIComponent(atob(boardHash)).split("|");
  const board = initialBoard();
  board.groups.yellow = list[0].trim();
  board.groups.green = list[1].trim();
  board.groups.blue = list[2].trim();
  board.groups.purple = list[3].trim();

  const colorMap = new Map();
  let wordIndex = 4;
  colors.forEach((color) => {
    const words = list.slice(wordIndex, wordIndex + 4);
    board.answers[color] = words.map((word) => {
      colorMap.set(word, color);
      return word;
    });
    wordIndex += 4;
  });

  colors.forEach((_, rowIdx) => {
    colors.forEach((_, colIdx) => {
      const wordIndex = 20 + 4 * rowIdx + colIdx;
      board.words[rowIdx][colIdx].text = list[wordIndex].trim();
      board.words[rowIdx][colIdx].group = colorMap.get(list[wordIndex]);
    });
  });

  return board;
};

export const deserializeBoardV2 = (boardHash) => {
  const colors = ["yellow", "green", "blue", "purple"];
  const board = initialBoard();
  const list = boardHash
    .slice(0, -16)
    .split(nonBase64Delimiter)
    .map((element) => atob(decodeURIComponent(element)));
  const groupList = list.slice(0, 4);
  const wordsList = list.slice(4);
  const order = [...boardHash.slice(-16)].map((letter) =>
    sortOrderString.indexOf(letter),
  );

  board.groups.yellow = groupList[0].trim();
  board.groups.green = groupList[1].trim();
  board.groups.blue = groupList[2].trim();
  board.groups.purple = groupList[3].trim();

  const colorMap = new Map();
  let wordIndex = 0;
  colors.forEach((color) => {
    const words = wordsList.slice(wordIndex, wordIndex + 4);
    board.answers[color] = words.map((word) => {
      colorMap.set(word, color);
      return word;
    });
    wordIndex += 4;
  });

  colors.forEach((_, rowIdx) => {
    colors.forEach((_, colIdx) => {
      const wordIndex = 4 * rowIdx + colIdx;
      const actualIndex = order[wordIndex];
      board.words[rowIdx][colIdx].text = wordsList[actualIndex].trim();
      board.words[rowIdx][colIdx].group = colorMap.get(wordsList[actualIndex]);
    });
  });

  return board;
};

export const currentVersion = "v2";
