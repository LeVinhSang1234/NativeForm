import React, {Component} from 'react';
import {
  Animated,
  Platform,
  PlatformColor,
  Pressable,
  StyleSheet,
} from 'react-native';
import Text from '../Text';
import moment from './momentTimezone';
import {TimezoneProps} from './timezone';

const PressAnimated = Animated.createAnimatedComponent(Pressable);

export declare type DatePickerProps = {
  value?: Date;
  format?: string;
  error?: string | boolean;
  borderColor?: string;
  activeBorderColor?: string;
  rangeBorderColor?: string;
  placeholder?: string;
  placeholderTextColor?: string;
  timezone?: string;
} & TimezoneProps;

class DatePicker extends Component<DatePickerProps> {
  animatedInput: Animated.Value;
  constructor(props: DatePickerProps) {
    super(props);
    const {error} = props;
    this.animatedInput = new Animated.Value(error ? 2 : 0);
    this.state = {isFocus: false};
  }

  getValue = () => {
    const {
      value,
      timezone = moment.tz.guess(),
      format,
      placeholder,
    } = this.props;
    if (value) {
      return moment(value).tz(timezone).format(format);
    }
    return placeholder;
  };

  render() {
    const {value, placeholder} = this.props;
    const {
      borderColor: borderColorProps = '#d9d9d9',
      activeBorderColor = '#40a9ff',
      rangeBorderColor = '#ff4d4f',
    } = this.props;

    const borderColor = this.animatedInput.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [borderColorProps, activeBorderColor, rangeBorderColor],
    });
    const placeholderTextColor = Platform.select({
      default: PlatformColor('placeholderText'),
      android: PlatformColor('?android:attr/placeholderText'),
    });
    const color = Platform.select({
      default: PlatformColor('label'),
      android: PlatformColor('?android:attr/textColor'),
    });
    return (
      <PressAnimated style={[styles.input, {borderColor}]}>
        <Text style={{color: value ? placeholderTextColor : color}}>
          {this.getValue()}
        </Text>
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
    fontSize: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default DatePicker;
