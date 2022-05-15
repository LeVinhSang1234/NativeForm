import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';

export declare type IRadioGroup = {
  value?: any;
  onChange?: (v: any) => any;
  horizontal?: boolean;
  error?: any;
};

class RadioGroup extends Component<IRadioGroup> {
  onChange = (_: boolean, v: any) => {
    const {onChange} = this.props;
    onChange?.(v);
  };

  renderChild = (child: any, isLast?: boolean) => {
    const {value, horizontal, error} = this.props;
    return {
      ...child,
      props: {
        ...child.props,
        error,
        style: [
          styles.child,
          {marginRight: horizontal && !isLast ? 16 : 0},
          child.props.style,
        ],
        onChange: this.onChange,
        checked: value === child.props.value,
      },
    };
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