const sortOrderString = "ABCDEFGHIJKLMNOP";
const nonBase64Delimiter = "-";

export const serializeBoardV1 = (board) => {
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

export const serializeBoardV2 = (board) => {
  const sortOrder = [...sortOrderString]
    .sort(() => Math.random() - 0.5)
    .join("");
  return `${Object.values(board.groups)
    .map((group) => btoa(encodeURIComponent(group)))
    .join(nonBase64Delimiter)}${nonBase64Delimiter}${board.words
    .flatMap((b) => b.map((c) => btoa(encodeURIComponent(c.text))))
    .join(nonBase64Delimiter)}${sortOrder}`;
};

export const serializeBoardV3 = (board) => {
  const sortOrder = [...sortOrderString]
    .sort(() => Math.random() - 0.5)
    .join("");
  const groups = Object.values(board.groups).join(nonBase64Delimiter);
  const words = board.words
    .flatMap((b) => b.map((c) => c.text))
    .join(nonBase64Delimiter);
  return base64UrlEncode(`${groups}${nonBase64Delimiter}${words}${sortOrder}`);
};

export const deserializeBoardV1 = (boardHash, board) => {
  const colors = ["yellow", "green", "blue", "purple"];
  const list = decodeURIComponent(atob(boardHash)).split("|");
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

export const deserializeBoardV2 = (boardHash, board) => {
  const colors = ["yellow", "green", "blue", "purple"];
  const list = boardHash
    .slice(0, -16)
    .split(nonBase64Delimiter)
    .map((element) => decodeURIComponent(atob(element)));
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

export const deserializeBoardV3 = (boardHash, board) => {
  const colors = ["yellow", "green", "blue", "purple"];
  const decoded = base64UrlDecode(boardHash);
  const list = decoded.slice(0, -16).split(nonBase64Delimiter);
  const groupList = list.slice(0, 4);
  const wordsList = list.slice(4);
  const order = [...decoded.slice(-16)].map((letter) =>
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

const base64UrlEncode = (input) => {
  let base64 = btoa(input);
  let base64Url = base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return base64Url;
};

const base64UrlDecode = (input) => {
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  let decodedData = atob(base64);
  return decodedData;
};
