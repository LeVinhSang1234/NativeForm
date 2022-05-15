import React, {Component} from 'react';
import {
  Platform,
  PlatformColor,
  Text as TextLibrary,
  TextProps,
} from 'react-native';

const TextFunc = React.forwardRef(
  (
    props: TextProps & {colorModeDark?: string; colorModeLight?: string},
    ref: any,
  ) => {
    const {children, style} = props;
    return (
      <TextLibrary
        ref={ref}
        style={[
          {
            color: PlatformColor(
              Platform.OS === 'ios' ? 'label' : '?android:attr/textColor',
            ),
          },
          style,
        ]}>
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
