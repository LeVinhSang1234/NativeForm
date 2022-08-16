import {Component} from 'react';

const characters =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

export function createID(r: number = 16): string {
  let a = '';
  for (var t = characters.length, c = 0; c < r; c++) {
    a += characters.charAt(Math.floor(Math.random() * t));
  }
  return a;
}

export class FreezeChild extends Component<{reload?: any}> {
  shouldComponentUpdate(nProps: {reload?: boolean}) {
    const {reload} = this.props;
    return reload !== nProps.reload;
  }

  render() {
    const {children} = this.props;
    return children;
  }
}

export const color = {
  danger: '#ff4d4f',
};
