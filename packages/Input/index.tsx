import React, {Component} from 'react';
import {
  Animated,
  NativeSyntheticEvent,
  Platform,
  PlatformColor,
  Pressable,
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
  style?: ViewStyle;
  styleInput?: TextStyle;
  activeBorderColor?: string;
  rangeBorderColor?: string;
  borderColor?: string;
  onChange?: (v: NativeSyntheticEvent<TextInputChangeEventData>) => any;
};

interface IState {
  isFocus: boolean;
}

class Input extends Component<ITextInputProps & TextInputProps, IState> {
  animatedInput: Animated.Value;
  TextInput?: TextInput | null;
  constructor(props: ITextInputProps & TextInputProps) {
    super(props);
    const {error} = props;
    this.animatedInput = new Animated.Value(error ? 2 : 0);
    this.state = {isFocus: false};
  }

  UNSAFE_componentWillReceiveProps(nProps: ITextInputProps & TextInputProps) {
    const {error} = this.props;
    const {isFocus} = this.state;
    if (!error && nProps.error) {
      Animated.timing(this.animatedInput, {
        toValue: 2,
        duration: 100,
        useNativeDriver: false,
      }).start();
    } else if (error && !nProps.error) {
      Animated.timing(this.animatedInput, {
        toValue: isFocus ? 1 : 0,
        duration: 100,
        useNativeDriver: false,
      }).start();
    }
  }

  onFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    const {onFocus, error} = this.props;
    if (!error) {
      Animated.timing(this.animatedInput, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }).start();
    }
    onFocus?.(e);
    this.setState({isFocus: true});
  };

  onBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    const {onBlur, error} = this.props;
    onBlur?.(e);
    if (!error) {
      Animated.timing(this.animatedInput, {
        toValue: 0,
        duration: 100,
        useNativeDriver: false,
      }).start();
    }
    this.setState({isFocus: false});
  };

  render() {
    const {
      style,
      value,
      activeBorderColor = '#40a9ff',
      rangeBorderColor = '#ff4d4f',
      borderColor: borderColorProps = '#d9d9d9',
      styleInput,
      onChange,
      onChangeValue,
      multiline,
      ...props
    } = this.props;
    const borderColor = this.animatedInput.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [borderColorProps, activeBorderColor, rangeBorderColor],
    });
    const color = Platform.select({
      default: PlatformColor('label'),
      android: PlatformColor('?android:attr/textColor'),
    });
    const paddingTop = multiline ? 6 : 11;
    return (
      <PressAnimated
        style={[styles.input, {borderColor}, {paddingTop}, style]}
        onPress={() => {
          this.TextInput?.focus?.();
        }}>
        <TextInput
          ref={ref => (this.TextInput = ref)}
          textAlignVertical="center"
          placeholderTextColor={Platform.select({
            default: PlatformColor('placeholderText'),
            android: PlatformColor('?android:attr/placeholderText'),
          })}
          {...props}
          multiline={multiline}
          style={[{color}, styleInput]}
          onChange={onChange}
          onChangeText={onChangeValue}
          onBlur={this.onBlur}
          onFocus={this.onFocus}>
          {value}
        </TextInput>
      </PressAnimated>
    );
  }
}

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
