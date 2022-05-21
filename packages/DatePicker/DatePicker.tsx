import React, {Component} from 'react';
import {Pressable} from 'react-native';
import Text from '../Text';
import {ProviderDate} from './Provider';

class DatePicker extends Component {
  render() {
    return (
      <ProviderDate.Consumer>
        {({open}) => (
          <Pressable onPress={open}>
            <Text>Sang</Text>
          </Pressable>
        )}
      </ProviderDate.Consumer>
    );
  }
}

export default DatePicker;
