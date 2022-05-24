import React, {Component, createContext} from 'react';
import {
  Animated,
  ColorSchemeName,
  Keyboard,
  LayoutAnimation,
  Platform,
  StyleSheet,
  TextStyle,
  useColorScheme,
  ViewStyle,
} from 'react-native';
import DatePicker from '..';
import {ITimezone} from './timezone';

// eslint-disable-next-line no-spaced-func
export const ProviderDate = createContext<{
  open: () => any;
  colorSchema: ColorSchemeName;
}>({
  open: () => {},
  colorSchema: 'light',
});

export declare type IDateProviderProps = {
  format?: string;
  timezone?: ITimezone;
  styles?: {
    viewDone?: ViewStyle;
    textDone?: TextStyle;
    buttonDone?: ViewStyle;
    bottomSheet?: ViewStyle;
  };
  textDone?: string;
  children?: any;
};

class SwapDateProvider extends Component<any> {
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

  componentWillUnmount() {
    this.removeKeyboard?.remove?.();
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
    const {children, colorSchema, styles: stylesProps, textDone} = this.props;
    const backgroundColor = colorSchema === 'light' ? '#fff' : '#141414';
    return (
      <ProviderDate.Provider value={{open: this.open, colorSchema}}>
        {children}
        <Animated.View
          style={[
            styles.view,
            {height: this.animatedHeight, backgroundColor},
            stylesProps?.bottomSheet,
          ]}>
          <DatePicker
            textDone={textDone}
            styles={stylesProps}
            close={this.close}
          />
        </Animated.View>
      </ProviderDate.Provider>
    );
  }
}

const DateProvider = (props: IDateProviderProps) => {
  const colorSchema = useColorScheme();
  return <SwapDateProvider {...props} colorSchema={colorSchema} />;
};

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
    shadowColor: '#000',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
});

export default DateProvider;
