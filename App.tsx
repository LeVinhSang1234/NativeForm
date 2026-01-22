import React from 'react';
import {Button, SafeAreaView} from 'react-native';
import Form, {Input, useForm} from './packages';

type TValue = {
  example: string;
  example1: {name: string}[];
};

const App = () => {
  const form = useForm<TValue>();

  return (
    <SafeAreaView>
      <Form.ScrollView
        form={form}
        onValuesChange={values => {
          console.log(values);
        }}
        initialValues={{example1: [{name: 'hello'}], example: '12121'}}>
        <Form.Item
          name="example"
          label="Example"
          rules={[{required: true, whitespace: true}]}>
          <Input placeholder="2" />
        </Form.Item>
        <Form.Item name="example1.0.name" label="Example" required>
          <Input placeholder="2" />
        </Form.Item>
        <Form.Item name="example1.1.name" label="Example" required>
          <Input placeholder="2" />
        </Form.Item>
        <Button
          title="Get Value"
          onPress={async () => {
            const error = await form.getFieldError('example1');
            console.log(error);
            // const errors = await form.getFieldsError();
            // const errorsWithNames = await form.getFieldsError(['example']);
            // const values = await form.getFieldsValue();
            // const valuesWithNames = await form.getFieldsValue(['example']);
            // const valuesWithFilter = await form.getFieldsValue();
            // const value = await form.getFieldValue('example');
            // const isToucheds = await form.isFieldsTouched();
            // const isTouched = await form.isFieldTouched('example');
            const data = await form.validateFields();
            console.log(data);
          }}
        />
      </Form.ScrollView>
    </SafeAreaView>
  );
};

export default App;
