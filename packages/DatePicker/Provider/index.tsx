import React, {Component, createContext} from 'react';
import {
  Animated,
  Keyboard,
  LayoutAnimation,
  Platform,
  StyleSheet,
} from 'react-native';
import DatePicker from '..';

export const ProviderDate = createContext({open: () => {}});

class DateProvider extends Component {
  height: number;
  animatedHeight: Animated.Value;
  removeKeyboard: any;

  constructor(props: any) {
    super(props);
    this.height = 0;
    this.animatedHeight = new Animated.Value(0);
    this.removeKeyboard = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      this.handleShow,
    );
  }

  handleShow = () => {
    this.close();
  };

  open = () => {
    Animated.timing(this.animatedHeight, {
      toValue: 370,
      duration: 0,
      useNativeDriver: false,
    }).start();
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        250,
        Platform.OS === 'ios' ? 'keyboard' : 'easeOut',
        'scaleY',
      ),
    );
  };

  close = () => {
    Animated.timing(this.animatedHeight, {
      toValue: 0,
      duration: 0,
      useNativeDriver: false,
    }).start();
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        250,
        Platform.OS === 'ios' ? 'keyboard' : 'easeOut',
        'scaleY',
      ),
    );
  };

  render() {
    const {children} = this.props;
    return (
      <ProviderDate.Provider value={{open: this.open}}>
        {children}
        <Animated.View style={[styles.view, {height: this.animatedHeight}]}>
          <DatePicker close={this.close} />
        </Animated.View>
      </ProviderDate.Provider>
    );
  }
}

const styles = StyleSheet.create({
  view: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: 'rgba(255,255,255,0.97)',
    shadowColor: '#000',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
});

export default DateProvider;
