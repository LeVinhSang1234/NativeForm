import React, {Component} from 'react';
import {Text as TextLibrary, TextProps, useColorScheme} from 'react-native';

const TextFunc = React.forwardRef(
  (
    props: TextProps & {colorModeDark?: string; colorModeLight?: string},
    ref: any,
  ) => {
    const {children, style} = props;
    const scheme = useColorScheme();
    const color = scheme === 'dark' ? '#ffffff' : '#000000';
    return (
      <TextLibrary ref={ref} style={[{color}, style]}>
        {children}
      </TextLibrary>
    );
  },
);

class Text extends Component<
  TextProps & {colorModeDark?: string; colorModeLight?: string}
> {
  render() {
    return <TextFunc {...this.props} />;
  }
}

export default Text;
