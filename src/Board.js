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

export const deserializeBoard = (boardHash, version) => {
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

export const currentVersion = "v1";
