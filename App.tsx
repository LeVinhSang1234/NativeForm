import React, {useCallback} from 'react';
import {Button, SafeAreaView, StyleSheet, TextInput} from 'react-native';
import Form from './packages';

const App = () => {
  const validator = useCallback((value, callback, touched) => {
    console.log(touched);
    if (!value) {
      callback('validate field');
    } else {
      callback();
    }
  }, []);

  const form = Form.useForm();

  return (
    <SafeAreaView style={styles.view}>
      <Form dotRequired="after">
        <Form.Item
          name="input"
          label="Input"
          rule={{required: true, message: 'Validate Field'}}>
          <TextInput style={styles.input} />
        </Form.Item>
        <Form.Item name="input2" label="Input2" rule={{validator: validator}}>
          <TextInput style={styles.input} />
        </Form.Item>
        <Form.Item
          name="input3"
          label="Input3"
          rule={{required: true, whitespace: true}}>
          <TextInput style={styles.input} />
        </Form.Item>
        <Form.Item name="input4" label="Input4" rule={{required: true}}>
          <TextInput style={styles.input} />
        </Form.Item>
        <Form.Item name="input4" label="Input4" rule={{required: true}}>
          <TextInput style={styles.input} />
        </Form.Item>
        <Form.Item name="input4" label="Input4" rule={{required: true}}>
          <Button
            title="Submit"
            onPress={() => {
              form.validateFields((errors, values) => {
                console.log(errors, values);
              });
            }}
          />
          <Button
            title="Submit Async"
            onPress={async () => {
              const {errors, values} = await form.validateFields();
              console.log(errors, values);
            }}
          />
        </Form.Item>
      </Form>
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
