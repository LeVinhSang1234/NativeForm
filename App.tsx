import React from 'react';
import {Button, SafeAreaView} from 'react-native';
import Form, {Input, useForm} from './packages';

const App = () => {
  const form = useForm<any>();

  return (
    <SafeAreaView>
      <Form.ScrollView
        form={form}
        onValuesChange={values => {
          console.log(values);
        }}>
        <Form.Item name="example" label="Example" required>
          <Input placeholder="2" />
        </Form.Item>
        <Button
          title="Get Value"
          onPress={async () => {
            const error = await form.getFieldError('example');
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
            if (Array.isArray(data)) {
              console.log('data is array', data);
            } else console.log(data);
          }}
        />
      </Form.ScrollView>
    </SafeAreaView>
  );
};

export default App;
