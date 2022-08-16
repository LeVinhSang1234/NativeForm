import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';

export declare type IRadioGroup = {
  value?: any;
  onChangeValue?: (v: any) => any;
  horizontal?: boolean;
  error?: any;
};

class RadioGroup extends Component<IRadioGroup> {
  onChangeValue = (_: boolean, v: any) => {
    const {onChangeValue} = this.props;
    onChangeValue?.(v);
  };

  renderChild = (child: any, isLast?: boolean) => {
    const {value, horizontal, error} = this.props;
    return React.cloneElement(child, {
      key: child.props.value,
      error,
      style: [
        styles.child,
        {marginRight: horizontal && !isLast ? 16 : 0},
        child.props.style,
      ],
      onChangeValue: this.onChangeValue,
      checked: value === child.props.value,
    });
  };

  render() {
    const {children, horizontal} = this.props;
    return (
      <View style={[styles.group, horizontal ? styles.groupFlex : {}]}>
        {Array.isArray(children)
          ? children.map((child: any, i) =>
              this.renderChild(child, i === children.length - 1),
            )
          : this.renderChild(children)}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  group: {},
  groupFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  child: {
    marginVertical: 6,
  },
});

export default RadioGroup;
