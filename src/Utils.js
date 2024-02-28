import React from "react";

export const useStickyState = (defaultValue, key) => {
  const [value, setValue] = React.useState(() => {
    const stickyValue = window.localStorage.getItem(key);
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
  });

  React.useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};

export const hasDuplicates = (array) => {
  return new Set(array).size !== array.length;
};

export const setEquals = (xs, ys) =>
  xs.size === ys.size && [...xs].every((x) => ys.has(x));
