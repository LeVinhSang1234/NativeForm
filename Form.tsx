import React, {Fragment} from 'react';
import {Button} from 'react-native';
import Form, {Input, Radio, RadioGroup} from './packages';

const FormClass = () => {
  const form1 = Form.useForm();
  return (
    <Fragment>
      <Form form={form1}>
        <Form.Item
          name="input"
          label="Input qqeqweq eq meq eqweqw ewqwqewqewq 123213123 1232132131231221"
          rule={{
            required: true,
            message: 'Validate Field',
            trigger: 'blur',
          }}>
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
    </Fragment>
  );
};

export default FormClass;
