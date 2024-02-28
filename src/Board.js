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
