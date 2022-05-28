import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import FormClass from './Form';

const App = () => {
  return (
    <SafeAreaView style={styles.view}>
      <FormClass />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  view: {
    flex: 1,
    marginHorizontal: 10,
  },
  input: {
    height: 40,
    borderWidth: 1,
  },
});

export default App;
