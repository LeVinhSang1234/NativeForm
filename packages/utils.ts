const characters =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function createID(r: number = 16, space?: string): string {
  let a = '';
  for (var t = characters.length, c = 0; c < r; c++) {
    a += characters.charAt(Math.floor(Math.random() * t));
    if (space) {
      if (a.replace(space, '').length % 6 === 0) {
        a += space;
      }
    }
  }
  return a;
}

export const color = {
  danger: '#ff4d4f',
};
