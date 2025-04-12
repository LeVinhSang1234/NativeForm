import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Animated,
  Appearance,
  ColorSchemeName,
  NativeSyntheticEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputChangeEventData,
  TextInputFocusEventData,
  TextInputProps,
  TextStyle,
  ViewStyle,
} from 'react-native';

const PressAnimated = Animated.createAnimatedComponent(Pressable);

export declare type ITextInputProps = {
  error?: string | boolean;
  onChangeValue?: (v: string) => any;
  style?: StyleProp<ViewStyle>;
  styleInput?: StyleProp<TextStyle>;
  activeBorderColor?: string;
  rangeBorderColor?: string;
  borderColor?: string;
  onChange?: (v: NativeSyntheticEvent<TextInputChangeEventData>) => any;
};

const Input = ({
  error,
  onChangeValue,
  style,
  styleInput,
  activeBorderColor = '#40a9ff',
  rangeBorderColor = '#ff4d4f',
  borderColor: borderColorProps = '#d9d9d9',
  onChange,
  multiline,
  onChangeText,
  value,
  onFocus,
  onBlur,
  ...props
}: ITextInputProps & TextInputProps) => {
  const [isFocus, setIsFocus] = useState(false);
  const [scheme, setScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme(),
  );
  const animatedInput = useRef(new Animated.Value(error ? 2 : 0));
  const textInputRef = useRef<TextInput | null>(null);

  useEffect(() => {
    const listener = Appearance.addChangeListener(({colorScheme}) => {
      setScheme(colorScheme);
    });

    return () => {
      listener.remove();
    };
  }, []);

  useEffect(() => {
    Animated.timing(animatedInput.current, {
      toValue: error ? 2 : isFocus ? 1 : 0,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [error, isFocus]);

  const handleFocus = useCallback(
    (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      if (!error) {
        Animated.timing(animatedInput.current, {
          toValue: 1,
          duration: 100,
          useNativeDriver: false,
        }).start();
      }
      onFocus?.(e);
      setIsFocus(true);
    },
    [error, onFocus],
  );

  const handleBlur = useCallback(
    (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      if (!error) {
        Animated.timing(animatedInput.current, {
          toValue: 0,
          duration: 100,
          useNativeDriver: false,
        }).start();
      }
      onBlur?.(e);
      setIsFocus(false);
    },
    [error, onBlur],
  );

  const borderColor = animatedInput.current.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [borderColorProps, activeBorderColor, rangeBorderColor],
  });

  const color = scheme === 'dark' ? '#ffffff' : '#000000';
  const paddingTop = multiline ? 6 : 11;

  return (
    <PressAnimated
      style={[styles.input, {borderColor}, {paddingTop}, style]}
      onPress={() => {
        textInputRef.current?.focus();
      }}>
      <TextInput
        ref={textInputRef}
        textAlignVertical="center"
        {...props}
        multiline={multiline}
        style={[{color}, styleInput]}
        onChange={onChange}
        onChangeText={t => {
          onChangeValue?.(t);
          onChangeText?.(t);
        }}
        onBlur={handleBlur}
        onFocus={handleFocus}>
        {value}
      </TextInput>
    </PressAnimated>
  );
};

const styles = StyleSheet.create({
  input: {
    minHeight: 40,
    width: '100%',
    borderRadius: 4,
    borderWidth: 1.4,
    paddingVertical: 5,
    paddingHorizontal: 11,
    textAlignVertical: 'center',
    fontSize: 14,
  },
});

export default Input;
