import React from 'react';
import {Button, SafeAreaView, StyleSheet} from 'react-native';
import Form, {Input, Radio, RadioGroup} from './packages';

const App = () => {
  const form = Form.useForm();

  return (
    <SafeAreaView style={styles.view}>
      <Form
        dotRequired="after"
        initialValues={{
          input: 'sang lv',
          radio: 'haha',
        }}>
        <Form.Item
          name="input"
          label="Input qqeqweq eq meq eqweqw ewqwqewqewq 123213123 1232132131231221"
          rule={{required: true, message: 'Validate Field'}}>
          <Input multiline />
        </Form.Item>
        <Form.Item
          name="radio"
          label="Radio"
          rule={{required: true, message: 'Validate Field'}}>
          <RadioGroup>
            <Radio label="hahaha121221321" value="haha" />
            <Radio label="hahaha 213213213" value="hahu" />
            <Radio label="hahaha 12312321321" value="ha" />
          </RadioGroup>
        </Form.Item>
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
            await form.resetFields();
          }}
        />
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
