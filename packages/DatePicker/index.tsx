import React, {Component} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import Text from '../Text';
import CDate from './Child';

const dayStartBySun = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dayStartByMon = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export declare type IDatePickerProps = {
  shortDays?: string[];
  startFromSunday?: boolean;
  value?: Date;
  close: () => any;
};

interface IDatePickerState {
  dates: any[];
  month: number;
  year: number;
}

class DatePickerSelect extends Component<IDatePickerProps, IDatePickerState> {
  initState: {month: number; year: number};
  constructor(props: IDatePickerProps) {
    super(props);
    const {value = new Date()} = props;
    const month = new Date(value).getMonth() + 1;
    const year = new Date(value).getFullYear();
    this.initState = {month, year};
    this.state = {dates: this.mapDate(), ...this.initState};
  }

  UNSAFE_shouldComponentUpdate(
    nProps: IDatePickerProps,
    nState: IDatePickerState,
  ) {
    const {month, year, dates} = this.state;
    return (
      month !== nState.month || year !== nState.year || dates !== nState.dates
    );
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

  checkActive = (date: number, now: Date, dateValue?: Date) => {
    const {month, year} = this.state || this.initState;
    const yearNow = now.getFullYear();
    const monthNow = now.getMonth() + 1;
    const dateN = now.getDate();
    if (!dateValue) {
      return {
        active: false,
        focus: yearNow === year && monthNow === month && date === dateN,
      };
    }
    return {
      active:
        dateValue.getFullYear() === year &&
        dateValue.getMonth() + 1 === month &&
        dateValue.getDate() === date,
    };
  };

  mapDate = () => {
    let {mdays, sDate, eDate, preMDate, now} = this.monthDays();
    const {startFromSunday = true, shortDays, value} = this.props;
    const dateValue = value ? new Date(value) : undefined;
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
        map.push(<CDate pre key={i} children={v} />);
        continue;
      }
      if (i > 0 && i <= mdays) {
        const checkAc = this.checkActive(i, now, dateValue);
        map.push(<CDate {...checkAc} children={i} key={i} />);
        continue;
      }
      map.push(<CDate next key={i} children={i - mdays} />);
    }
    return map;
  };

  render() {
    const {dates} = this.state;
    const {close} = this.props;
    return (
      <View style={styles.view}>
        <View style={styles.viewDone}>
          <View />
          <Pressable onPress={close} style={styles.pressable}>
            <Text style={styles.textDone}>Done</Text>
          </Pressable>
        </View>
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
    borderBottomColor: '#f4f4f4',
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  textDone: {
    fontWeight: '600',
    color: '#1890ff',
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
