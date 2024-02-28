class Board {
  constructor(groups, words) {
    this.groups = groups;
    this.words = words;
  }
}

class BoardWords {
  constructor(text, group) {
    this.text = text;
    this.group = group;
  }
}

export function initialBoard() {
  const groups = {
    yellow: "",
    green: "",
    blue: "",
    purple: "",
  };
  const groupsArray = Object.entries(groups);
  var words = [];

  for (let i = 0; i < groupsArray.length; i++) {
    words[i] = [];
    for (let j = 0; j < groupsArray.length; j++) {
      words[i][j] = new BoardWords("", groupsArray[i][0]);
    }
  }

  return new Board(groups, words);
}

export function serializeBoard(board, version) {
  return btoa(
    encodeURIComponent(
      `${Object.values(board.groups).join("|")}|${board.words
        .flatMap((b) => b.map((c) => c.text))
        .join("|")}`,
    ),
  );
}

export function deserializeBoard(boardHash, version) {
  const list = decodeURIComponent(atob(boardHash)).split("|");
  const board = initialBoard();
  board.groups.yellow = list[0];
  board.groups.green = list[1];
  board.groups.blue = list[2];
  board.groups.purple = list[3];

  board.words[0][0].text = list[4];
  board.words[0][1].text = list[5];
  board.words[0][2].text = list[6];
  board.words[0][3].text = list[7];

  board.words[1][0].text = list[8];
  board.words[1][1].text = list[9];
  board.words[1][2].text = list[10];
  board.words[1][3].text = list[11];

  board.words[2][0].text = list[12];
  board.words[2][1].text = list[13];
  board.words[2][2].text = list[14];
  board.words[2][3].text = list[15];

  board.words[3][0].text = list[16];
  board.words[3][1].text = list[17];
  board.words[3][2].text = list[18];
  board.words[3][3].text = list[19];

  return board;
}

export const currentVersion = "v1";
