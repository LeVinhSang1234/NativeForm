import React, {memo, useEffect, useRef} from 'react';
import {
  Animated,
  StyleProp,
  StyleSheet,
  Text as TextLibary,
  TextStyle,
} from 'react-native';
import {useFormContextGlobal} from './provider';

interface TextErrorProps {
  error?: string;
  errorStyle?: StyleProp<TextStyle>;
}

const TextError = ({error, errorStyle}: TextErrorProps) => {
  const animated = useRef(new Animated.Value(0));
  const {Text = TextLibary} = useFormContextGlobal();
  const TextAnimated = useRef(Animated.createAnimatedComponent(Text)).current;

  useEffect(() => {
    if (!error) return animated.current.setValue(0);
    Animated.timing(animated.current, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [error]);

  const translateY = animated.current.interpolate({
    inputRange: [0, 1],
    outputRange: [-22, 0],
  });

  return (
    <TextAnimated
      style={[
        styles.textError,
        errorStyle,
        {
          transform: [{scaleY: animated.current}, {translateY}],
          opacity: animated.current,
        },
      ]}>
      {error}
    </TextAnimated>
  );
};

const styles = StyleSheet.create({
  textError: {
    fontSize: 13,
    minHeight: 22,
    paddingBottom: 12,
    fontWeight: '500',
    color: '#ff0000',
  },
});

export default memo(TextError);
