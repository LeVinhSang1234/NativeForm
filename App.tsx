import React from 'react';
import {Button, SafeAreaView, ScrollView, StyleSheet} from 'react-native';
import Form, {Input, Radio, RadioGroup} from './packages';

const App = () => {
  const form1 = Form.useForm();
  const form2 = Form.useForm();

  return (
    <SafeAreaView style={styles.view}>
      <ScrollView>
        <Form
          form={form1}
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
              form1.validateFields((errors, values) => {
                console.log(errors, values);
              });
            }}
          />
          <Button
            title="Submit Async"
            onPress={async () => {
              await form1.resetFields();
            }}
          />
          <Form
            form={form2}
            dotRequired="after"
            initialValues={{
              input: 'sang lv 1231312',
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
                form2.validateFields((errors, values) => {
                  console.log(errors, values);
                });
              }}
            />
            <Button
              title="Submit Async"
              onPress={async () => {
                await form2.resetFields();
              }}
            />
          </Form>
        </Form>
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
