import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
import {useFormItem} from '../Form/provider';

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
  error: errorProp,
  onChangeValue,
  style,
  styleInput,
  activeBorderColor = '#40a9ff',
  rangeBorderColor = '#ff4d4f',
  borderColor: borderColorProps = '#d9d9d9',
  onChange,
  multiline,
  onChangeText,
  value: valueProp,
  onFocus,
  onBlur,
  ...props
}: ITextInputProps & TextInputProps) => {
  //Inside a Form.Item the item owns the value and the error, standalone the
  //props do. name is only filled in by a Form.Item.
  const item = useFormItem<string>();
  const inItem = !!item.name;
  const error = inItem ? item.error : errorProp;
  const value = inItem ? item.value : valueProp;

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
      onFocus?.(e);
      setIsFocus(true);
    },
    [onFocus],
  );

  const handleBlur = useCallback(
    (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      onBlur?.(e);
      item.onBlur?.();
      setIsFocus(false);
    },
    [onBlur, item],
  );

  const borderColor = useMemo(
    () =>
      animatedInput.current.interpolate({
        inputRange: [0, 1, 2],
        outputRange: [borderColorProps, activeBorderColor, rangeBorderColor],
      }),
    [borderColorProps, activeBorderColor, rangeBorderColor],
  );

  const handlePress = useCallback(() => {
    textInputRef.current?.focus();
  }, []);

  const handleChangeText = useCallback(
    (t: string) => {
      item.onChangeValue?.(t);
      onChangeValue?.(t);
      onChangeText?.(t);
    },
    [item, onChangeValue, onChangeText],
  );

  const color = scheme === 'dark' ? '#ffffff' : '#000000';
  const paddingTop = multiline ? 6 : 11;

  return (
    <PressAnimated
      style={[styles.input, {borderColor}, {paddingTop}, style]}
      onPress={handlePress}>
      <TextInput
        ref={textInputRef}
        textAlignVertical="center"
        {...props}
        multiline={multiline}
        style={[{color}, styleInput]}
        onChange={onChange}
        onChangeText={handleChangeText}
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
