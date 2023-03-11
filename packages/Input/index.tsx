import React, {Component} from 'react';
import {
  Animated,
  Appearance,
  ColorSchemeName,
  NativeEventSubscription,
  NativeSyntheticEvent,
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
  scheme: ColorSchemeName;
}

class Input extends Component<ITextInputProps & TextInputProps, IState> {
  animatedInput: Animated.Value;
  TextInput?: TextInput | null;
  listener: NativeEventSubscription;
  constructor(props: ITextInputProps & TextInputProps) {
    super(props);
    const {error} = props;
    this.animatedInput = new Animated.Value(error ? 2 : 0);
    this.state = {isFocus: false, scheme: Appearance.getColorScheme()};
    this.listener = Appearance.addChangeListener(({colorScheme}) => {
      this.setState({scheme: colorScheme});
    });
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

  componentWillUnmount(): void {
    this.listener?.remove?.();
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
    const {scheme} = this.state;
    const borderColor = this.animatedInput.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [borderColorProps, activeBorderColor, rangeBorderColor],
    });
    const color = scheme === 'dark' ? '#ffffff' : '#000000';
    const placeholderTextColor = '#e3e3e3';
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
          placeholderTextColor={placeholderTextColor}
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
