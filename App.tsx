import React from 'react';
import {Button, SafeAreaView, StyleSheet} from 'react-native';
import Form, {Input, Radio, RadioGroup} from './packages';
import {ChildrenItem} from './packages/Form/types';

const App = () => {
  const form1 = Form.useForm();
  return (
    <SafeAreaView style={styles.view}>
      <Form.ScrollView>
        <Form.Item
          name="input"
          label="Input qqeqweq eq meq eqweqw ewqwqewqewq 123213123 1232132131231221"
          rule={{
            required: true,
            message: 'Validate Field',
            trigger: 'blur',
            whitespace: true,
          }}>
          {({onChangeValue, value, onBlur, error}: ChildrenItem) => {
            return (
              <Input
                multiline
                placeholder="Aa"
                onChangeText={onChangeValue}
                value={value}
                error={error}
                onBlur={onBlur}
              />
            );
          }}
        </Form.Item>
        <Form.Item
          name="input7"
          label="Input"
          rule={{
            required: true,
            message: 'Validate Field',
            trigger: 'blur',
            whitespace: true,
          }}>
          <Input />
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
      </Form.ScrollView>
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
