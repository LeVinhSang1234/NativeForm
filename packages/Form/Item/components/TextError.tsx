import React, {Component} from 'react';
import Text from '@/Text';
import {color} from '@/utils';
import {Animated, StyleSheet, TextStyle, View} from 'react-native';

const TextAnimated = Animated.createAnimatedComponent(Text);

interface TextErrorProps {
  error?: string;
  errorStyle?: TextStyle;
}

class TextError extends Component<TextErrorProps> {
  animated: Animated.Value;
  constructor(props: TextErrorProps) {
    super(props);
    const {error} = props;
    this.animated = new Animated.Value(error ? 1 : 0);
  }

  shouldComponentUpdate(nProps: TextErrorProps) {
    const {error, errorStyle} = this.props;
    return error !== nProps.error || errorStyle !== nProps.errorStyle;
  }

  UNSAFE_componentWillReceiveProps(nProps: TextErrorProps) {
    const {error} = nProps;
    if (!error) {
      this.animated.setValue(0);
    } else {
      Animated.timing(this.animated, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  }

  render() {
    const {error, errorStyle} = this.props;
    const translateY = this.animated.interpolate({
      inputRange: [0, 1],
      outputRange: [-22, 0],
    });
    return (
      <View style={styles.error} removeClippedSubviews>
        <TextAnimated
          style={[
            styles.textError,
            errorStyle,
            {
              transform: [{scaleY: this.animated}, {translateY}],
              opacity: this.animated,
            },
          ]}>
          {error}
        </TextAnimated>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  error: {
    overflow: 'hidden',
  },
  textError: {
    fontSize: 12,
    color: color.danger,
    minHeight: 22,
    paddingBottom: 5,
    fontWeight: '500',
  },
});

export default TextError;
