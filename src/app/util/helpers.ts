export function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getTrueMod(x: number, y: number) {
  if (x >= 0) {
    return x % y;
  }

  return (y - ((x * -1) % y)) % y
}

export function getVisibleTextColor(color: string) {
  if (!color) {
    return null;
  }

  var red = parseInt(color.substring(1, 3), 16);
  var blue = parseInt(color.substring(3, 5), 16);
  var green = parseInt(color.substring(5, 7), 16);
  const avg = (red + green + blue) / 3;
  return avg > (255 / 2) ? '#000000' : '#ffffff';
}

// https://bost.ocks.org/mike/shuffle/
export function shuffle<T>(arr: T[]) {
  var m = arr.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = arr[m];
    arr[m] = arr[i];
    arr[i] = t;
  }

  return arr;
}

export function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}
