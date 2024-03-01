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

export const initialBoard = () => {
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
  const list = decodeURIComponent(atob(boardHash)).split("|");
  const board = initialBoard();
  board.groups.yellow = list[0].trim();
  board.groups.green = list[1].trim();
  board.groups.blue = list[2].trim();
  board.groups.purple = list[3].trim();

  const colorMap = new Map();
  colorMap.set(list[4], "yellow");
  colorMap.set(list[5], "yellow");
  colorMap.set(list[6], "yellow");
  colorMap.set(list[7], "yellow");

  colorMap.set(list[8], "green");
  colorMap.set(list[9], "green");
  colorMap.set(list[10], "green");
  colorMap.set(list[11], "green");

  colorMap.set(list[12], "blue");
  colorMap.set(list[13], "blue");
  colorMap.set(list[14], "blue");
  colorMap.set(list[15], "blue");

  colorMap.set(list[16], "purple");
  colorMap.set(list[17], "purple");
  colorMap.set(list[18], "purple");
  colorMap.set(list[19], "purple");

  board.words[0][0].text = list[20].trim();
  board.words[0][0].group = colorMap.get(list[20]);
  board.words[0][1].text = list[21].trim();
  board.words[0][1].group = colorMap.get(list[21]);
  board.words[0][2].text = list[22].trim();
  board.words[0][2].group = colorMap.get(list[22]);
  board.words[0][3].text = list[23].trim();
  board.words[0][3].group = colorMap.get(list[23]);

  board.words[1][0].text = list[24].trim();
  board.words[1][0].group = colorMap.get(list[24]);
  board.words[1][1].text = list[25].trim();
  board.words[1][1].group = colorMap.get(list[25]);
  board.words[1][2].text = list[26].trim();
  board.words[1][2].group = colorMap.get(list[26]);
  board.words[1][3].text = list[27].trim();
  board.words[1][3].group = colorMap.get(list[27]);

  board.words[2][0].text = list[28].trim();
  board.words[2][0].group = colorMap.get(list[28]);
  board.words[2][1].text = list[29].trim();
  board.words[2][1].group = colorMap.get(list[29]);
  board.words[2][2].text = list[30].trim();
  board.words[2][2].group = colorMap.get(list[30]);
  board.words[2][3].text = list[31].trim();
  board.words[2][3].group = colorMap.get(list[31]);

  board.words[3][0].text = list[32].trim();
  board.words[3][0].group = colorMap.get(list[32]);
  board.words[3][1].text = list[33].trim();
  board.words[3][1].group = colorMap.get(list[33]);
  board.words[3][2].text = list[34].trim();
  board.words[3][2].group = colorMap.get(list[34]);
  board.words[3][3].text = list[35].trim();
  board.words[3][3].group = colorMap.get(list[35]);

  return board;
};

export const currentVersion = "v1";
