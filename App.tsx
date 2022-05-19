import React from 'react';
import {Button, SafeAreaView, ScrollView, StyleSheet} from 'react-native';
import Form, {Input, Radio, RadioGroup} from './packages';

const App = () => {
  const form1 = Form.useForm();
  return (
    <SafeAreaView style={styles.view}>
      <ScrollView>
        <Form form={form1}>
          <Form.Item
            name="input"
            label="Input qqeqweq eq meq eqweqw ewqwqewqewq 123213123 1232132131231221"
            rule={{required: true, message: 'Validate Field', trigger: 'blur'}}>
            <Input multiline placeholder="Aa" />
          </Form.Item>
          <Form.Item
            name="radio"
            label="Radio"
            rule={{required: true, message: 'Validate Field'}}>
            <RadioGroup>
              <Radio label="hahaha121221321" value="haha" />
              <Radio label="hahaha 213213213" value="hahu" />
            </RadioGroup>
          </Form.Item>
        </Form>
        <Button
          title="Submit"
          onPress={() => {
            form1.validateFields((errors, values) => {
              console.log(errors, values);
            });
          }}
        />
        <Button
          title="Submit Reset Async"
          onPress={async () => {
            await form1.resetFields();
          }}
        />
      </ScrollView>
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
