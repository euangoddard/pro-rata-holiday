export const range = (start: number, end?: number): readonly number[] => {
  if (typeof end === "undefined") {
    end = start;
    start = 0;
  }
  if (end - start) {
    return [...Array(end - start).keys()].map((i) => i + start);
  } else {
    return [];
  }
};
