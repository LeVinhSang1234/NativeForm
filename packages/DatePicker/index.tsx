import React, {Component} from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Text from '../Text';
import CDate from './Child';
import {ProviderDate} from './Provider';

const dayStartBySun = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dayStartByMon = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export declare type IDatePickerProps = {
  shortDays?: string[];
  startFromSunday?: boolean;
  value?: Date;
  close: () => any;
  styles?: {
    viewDone?: ViewStyle;
    textDone?: TextStyle;
    buttonDone?: ViewStyle;
  };
  textDone?: string;
};

interface IDatePickerState {
  dates: any[];
  month: number;
  year: number;
  date?: number;
}

class DatePickerSelect extends Component<IDatePickerProps, IDatePickerState> {
  initState: {month: number; year: number; date?: number};
  constructor(props: IDatePickerProps) {
    super(props);
    const {value = new Date()} = props;
    const month = new Date(value).getMonth() + 1;
    const year = new Date(value).getFullYear();
    this.initState = {month, year, date: undefined};
    this.state = {dates: this.mapDate(), ...this.initState};
  }

  UNSAFE_shouldComponentUpdate(
    nProps: IDatePickerProps,
    nState: IDatePickerState,
  ) {
    const {dates} = this.state;
    return dates !== nState.dates;
  }

  monthDays = () => {
    const {month, year} = this.state || this.initState;
    return {
      mdays: new Date(year, month, 0).getDate(),
      now: new Date(),
      sDate: new Date(year, month - 1, 1).getDay(),
      eDate: new Date(year, month, 0).getDay(),
      preMDate: new Date(year, month - 1, 0).getDate(),
    };
  };

  checkActive = (date: number, now: Date) => {
    const {month, year, date: dateState} = this.state || this.initState;
    const yearNow = now.getFullYear();
    const monthNow = now.getMonth() + 1;
    const dateN = now.getDate();
    return {
      active: dateState === date,
      focus: yearNow === year && monthNow === month && date === dateN,
    };
  };

  onChange = (date: number, month: number) => {
    const {year, month: monthState} = this.state;
    let monthNow = month;
    let yearNow = year;
    if (month > 12) {
      monthNow = 1;
      yearNow += 1;
    }
    if (monthState !== month) {
      LayoutAnimation.configureNext(
        LayoutAnimation.create(
          250,
          Platform.OS === 'ios' ? 'keyboard' : 'easeOut',
          'opacity',
        ),
      );
    }
    this.setState({month: monthNow, year: yearNow, date}, () => {
      this.setState({dates: this.mapDate()});
    });
  };

  mapDate = () => {
    let {mdays, sDate, eDate, preMDate, now} = this.monthDays();
    const {startFromSunday = true, shortDays} = this.props;
    const {month} = this.state || this.initState;
    const days = shortDays || (startFromSunday ? dayStartBySun : dayStartByMon);
    if (!startFromSunday && !sDate) {
      sDate = 7;
    }
    const map: any[] = days.map(i => <CDate key={i} children={i} />);
    const is = -sDate + 1 + Number(!startFromSunday);
    const ifr = mdays + (7 - eDate - Number(!!startFromSunday));
    for (let i = is; i <= ifr; i++) {
      if (i <= 0) {
        const v = preMDate + i;
        map.push(
          <CDate
            onChange={() => this.onChange(v, month - 1)}
            pre
            key={i}
            children={v}
          />,
        );
        continue;
      }
      if (i > 0 && i <= mdays) {
        const checkAc = this.checkActive(i, now);
        map.push(
          <CDate
            {...checkAc}
            onChange={() => this.onChange(i, month)}
            children={i}
            key={i}
          />,
        );
        continue;
      }
      map.push(
        <CDate
          next
          key={i}
          onChange={() => this.onChange(i - mdays, month + 1)}
          children={i - mdays}
        />,
      );
    }
    return map;
  };

  close = () => {
    const {close} = this.props;
    this.reset(close);
  };

  reset = (callback?: any) => {
    const {value = new Date()} = this.props;
    const month = new Date(value).getMonth() + 1;
    const year = new Date(value).getFullYear();
    this.initState = {month, year, date: undefined};
    this.setState({...this.initState}, () => {
      this.setState({dates: this.mapDate()});
      callback?.();
    });
  };

  render() {
    const {dates} = this.state;
    const {styles: stylesProps, textDone} = this.props;
    return (
      <View style={styles.view}>
        <ProviderDate.Consumer>
          {({colorSchema}) => {
            const backgroundColor =
              colorSchema === 'light' ? '#f8f8f8' : '#6a6a6a';
            return (
              <View
                style={[
                  styles.viewDone,
                  {backgroundColor},
                  stylesProps?.viewDone,
                ]}>
                <View />
                <Pressable
                  onPress={this.close}
                  style={[styles.pressable, stylesProps?.buttonDone]}>
                  <Text style={[styles.textDone, stylesProps?.textDone]}>
                    {textDone}
                  </Text>
                </Pressable>
              </View>
            );
          }}
        </ProviderDate.Consumer>
        <View style={styles.swapViewDate}>
          <View style={styles.viewChild}>{dates}</View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
  },
  swapViewDate: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  viewChild: {
    maxWidth: 350,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  viewDone: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  textDone: {
    fontWeight: '600',
  },
  pressable: {
    height: '100%',
    width: 70,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

export default DatePickerSelect;
