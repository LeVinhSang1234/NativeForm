import React, {Component} from 'react';
import {
  Animated,
  NativeSyntheticEvent,
  Platform,
  PlatformColor,
  StyleSheet,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
  TextStyle,
  ViewStyle,
} from 'react-native';

export declare type ITextInputProps = {
  error?: string | boolean;
  onChangeText?: (v: string) => any;
  style?: ViewStyle;
  styleInput?: TextStyle;
  activeBorderColor?: string;
  rangeBorderColor?: string;
  borderColor?: string;
};

interface IState {
  isFocus: boolean;
}

class Input extends Component<ITextInputProps & TextInputProps, IState> {
  animatedInput: Animated.Value;
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
      onChangeText,
      value,
      activeBorderColor = '#40a9ff',
      rangeBorderColor = '#ff4d4f',
      borderColor: borderColorProps = '#d9d9d9',
      styleInput,
      ...props
    } = this.props;
    const borderColor = this.animatedInput.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [borderColorProps, activeBorderColor, rangeBorderColor],
    });
    const color = PlatformColor(
      Platform.OS === 'ios' ? 'label' : '?android:attr/textColor',
    );
    return (
      <Animated.View style={[styles.input, {borderColor}, style]}>
        <TextInput
          textAlignVertical="center"
          {...props}
          style={[{color}, styleInput]}
          placeholderTextColor={PlatformColor('placeholderText')}
          onChange={undefined}
          onChangeText={onChangeText}
          onBlur={this.onBlur}
          onFocus={this.onFocus}>
          {value}
        </TextInput>
      </Animated.View>
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
    paddingTop: 7.5,
  },
});

export default Input;
