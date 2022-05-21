import React, {Component} from 'react';
import {Pressable, StyleSheet, useWindowDimensions} from 'react-native';
import Text from '../Text';

class SwapChildDate extends Component<any> {
  UNSAFE_shouldComponentUpdate(nProps: any) {
    const {children, width, active} = this.props;
    return (
      children !== nProps.children ||
      width !== nProps.width ||
      active !== nProps.active
    );
  }

  render() {
    const {children, width, next, pre, active, focus} = this.props;
    const widthView = (width - 20) / 7;
    const opacity = next || pre ? 0.3 : 1;
    return (
      <Pressable
        style={[
          styles.view,
          {width: widthView, height: widthView, opacity},
          active && styles.viewActive,
          focus && styles.viewFocus,
        ]}>
        <Text style={[styles.text, active && styles.textActive]}>
          {children}
        </Text>
      </Pressable>
    );
  }
}

const ChildDate = (props: any) => {
  const {width} = useWindowDimensions();
  return <SwapChildDate width={width} {...props} />;
};

const styles = StyleSheet.create({
  view: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 50,
    maxHeight: 50,
    borderRadius: 100,
  },
  viewActive: {
    backgroundColor: '#1890ff',
  },
  viewFocus: {
    borderColor: '#1890ff',
    borderWidth: 1,
  },
  text: {
    fontWeight: '500',
    color: '#000',
  },
  textActive: {
    color: '#fff',
  },
});

export default ChildDate;
