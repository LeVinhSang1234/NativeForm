import React, {Component} from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from 'react-native';
import Text from '../Text';

interface IProps {
  width?: number;
  height?: number;
  bordered?: boolean;
  checked?: boolean;
  borderColorChecked?: string;
  duration?: number;
  dotColorChecked?: string;
  disabled?: boolean;
  defaultChecked?: boolean;
  onChangeValue?: (c: boolean, v?: any) => any;
  style?: ViewStyle;
  label?: string;
  styleLabel?: TextStyle;
  value?: any;
  error?: any;
}

interface IState {
  checked?: boolean;
}

class Radio extends Component<IProps, IState> {
  static defaultProps = {
    width: 16,
    height: 16,
    bordered: true,
    borderColorChecked: '#21C0F6',
    checked: undefined,
    duration: 300,
    dotColorChecked: '#21C0F6',
    disabled: false,
    defaultChecked: false,
  };
  animated: Animated.Value;

  constructor(props: IProps) {
    super(props);
    const checked = !!props.checked || !!props.defaultChecked;
    this.state = {checked};
    this.animated = new Animated.Value(checked ? 1 : props.error ? 2 : 0);
  }

  UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    const {checked, error} = nextProps;
    const {checked: checkedState} = this.state;
    if (checked !== undefined && checked !== checkedState) {
      this.handleChangeChecked();
    }
    if (error && !this.props.error) {
      Animated.timing(this.animated, {
        toValue: 2,
        duration: 100,
        useNativeDriver: false,
      }).start();
    } else if (this.props.error && !error) {
      Animated.timing(this.animated, {
        toValue: checked ? 1 : 0,
        duration: 100,
        useNativeDriver: false,
      }).start();
    }
  }

  handleChangeChecked = () => {
    const {checked} = this.state;
    const {duration, disabled} = this.props;
    if (disabled) {
      return;
    }
    let toValue = 0;
    if (!checked) {
      toValue = 1;
    }
    Animated.timing(this.animated, {
      duration: duration,
      toValue,
      useNativeDriver: false,
    }).start();
    this.setState({checked: !checked});
  };

  handlePress = () => {
    const {checked} = this.state;
    const {onChangeValue, checked: checkedProps, value} = this.props;
    if (checkedProps === undefined) {
      this.handleChangeChecked();
    }
    onChangeValue?.(!checked, value);
  };

  render() {
    const {
      width = 16,
      height = 16,
      style,
      bordered,
      borderColorChecked = '#21C0F6',
      dotColorChecked = '#21C0F6',
      disabled,
      label,
      styleLabel,
    } = this.props;
    const {checked} = this.state;
    const borderColor = this.animated.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [
        '#A8A8A8',
        disabled ? '#A8A8A8' : borderColorChecked,
        '#ff4d4f',
      ],
    });
    const backgroundColor = this.animated.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [
        'rgba(255, 255, 255, 0)',
        checked
          ? disabled
            ? '#A8A8A8'
            : dotColorChecked
          : 'rgba(255, 255, 255, 0)',
        'rgba(255, 255, 255, 0)',
      ],
    });

    let borderWidth = 1;
    if (!bordered && checked) {
      borderWidth = width / 4;
    }
    const opacity = disabled ? 0.5 : 1;

    return (
      <Pressable onPress={this.handlePress} style={[styles.checkbox, style]}>
        <Animated.View
          style={[
            styles.radio,
            {width, height},
            styles.alignCenter,
            {borderColor, borderWidth, opacity},
          ]}>
          {bordered ? (
            <Animated.View
              style={[
                styles.border,
                {width: width / 2, height: height / 2, backgroundColor},
              ]}
            />
          ) : null}
        </Animated.View>
        {label ? <Text style={[styles.label, styleLabel]}>{label}</Text> : null}
      </Pressable>
    );
  }
}

const styles = StyleSheet.create({
  radio: {
    borderRadius: 100,
    borderStyle: 'solid',
  },
  alignCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  border: {
    borderRadius: 100,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginLeft: 5,
  },
});

export default Radio;
