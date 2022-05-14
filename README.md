# API

## Form

#### colon:

Configure the default value of colon for Form.Item. Indicates whether the colon after the label is displayed (only effective when prop layout is horizontal)

#### form (FormInstance)

Form control instance created by Form.useForm() or Form.create()(Component).
Automatically created when not provided

#### initialValues (object)

Set value by Form initialization or reset

#### validateFirst (boolean)

Whether stop validate on first rule of error for this field.

#### style <ViewStyle>

#### formItemLayout

```
labelCol: {
    xs: number;
    sm: number;
};
wrapperCol: {
    xs: number;
    sm: number;
};
```

#### dotRequired ("before" | "after")

Configure the default value of _ label for Form.Item. Indicates whether the _ label the display before or after label form Item

## FormInstance

#### setFieldsValue

Set the value of fields.

```
({[fieldName]: value }, {[fieldName]: error}) => void
```

#### setFieldValue

Set the value of a field.

```
([fieldName], value, error) => void
```

#### getFieldValue

Get the value of a field.

```
Function(fieldName: string)
```

#### getFieldsValue

Get the specified fields' values. If you don't specify a parameter, you will get all fields' values.

```
Function()
```

#### validateFields

Validate the specified fields and get their values and errors. If you don't specify the parameter of fieldNames, you will validate all fields.

```
(
  callback(errors: {[fieldName]: any}[], values: {[key: string]: any}),
  {fields: fieldNames: string[], excepts: fieldNames: string[]}
) => Promise<{errors, values}>
```

#### resetFields

Reset the specified fields' value(to initialValue) and status. If you don't specify a parameter, all the fields will be reset.

```
Function(fieldNames: string[], errors: {[fieldName]: any})
```

#### setFieldError

Set the error of a field.

```
Function(fieldName: string, error: any)

```

#### getTouched

get whether any of fields is touched

```
Function(fieldName: string) => boolean

```

## Form.Item 
``
!must be inside the Form
``

#### defaultValue

set the default value a field

#### checked <boolean>

set the checked value a field

#### name <required>

field name

#### label <required>

label text

#### value

field value

#### rule

Validation Rules

``
whitespace?: treat required fields that only contain whitespace as errors;
required?: indicates whether field is required;
message?: validation error message;
validator?: custom validate function (Note: callback must be called)

```
Function(value: any, callback: (messageError?: any) => any, touched?: boolean) => any;
```

trigger?: 'onChange' | 'blur';
``

#### validateFirst

Whether stop validate on first rule of error for this field.

#### colon

Configure the default value of colon for Form.Item. Indicates whether the colon after the label is displayed (only effective when prop layout is horizontal)

#### dotRequired

Configure the default value of _ label for Form.Item. Indicates whether the _ label the display before or after label form Item

#### formItemLayout

```
labelCol: {
    xs: number;
    sm: number;
};
wrapperCol: {
    xs: number;
    sm: number;
};
```

# Example

```js
//Function Component

import React, {useCallback} from 'react';
import {Button, SafeAreaView, StyleSheet, TextInput} from 'react-native';
import Form from '@sang1102/react-native-form';

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
```

```js
//Class Component

import React, {Component} from 'react';
import {Button, SafeAreaView, StyleSheet, TextInput} from 'react-native';
import Form from '@sang1102/react-native-form';

class App extends Component {
  validator = (value, callback, touched) => {
    console.log(touched);
    if (!value) {
      callback('validate field');
    } else {
      callback();
    }
  };

  render() {
    const {form} = this.props;
    return (
      <SafeAreaView style={styles.view}>
        <Form dotRequired="after">
          <Form.Item
            name="input"
            label="Input"
            rule={{required: true, message: 'Validate Field'}}>
            <TextInput style={styles.input} />
          </Form.Item>
          <Form.Item
            name="input2"
            label="Input2"
            rule={{validator: this.validator}}>
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
  }
}

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

export default Form.create()(App);
```

```js
// many Form

const form1 = useForm();
const form2 = useForm();

<Form form={form1} dotRequired="after">
  <Form.Item
    name="input"
    label="Input"
    rule={{required: true, message: 'Validate Field'}}>
    <TextInput style={styles.input} />
  </Form.Item>
  <Button
    title="Submit Async"
    onPress={async () => {
      const {errors, values} = await form1.validateFields();
      console.log(errors, values);
    }}
  />
</Form>;

<Form form={form2} dotRequired="after">
  <Form.Item
    name="input"
    label="Input"
    rule={{required: true, message: 'Validate Field'}}>
    <TextInput style={styles.input} />
  </Form.Item>
  <Button
    title="Submit Async"
    onPress={async () => {
      const {errors, values} = await form2.validateFields();
      console.log(errors, values);
    }}
  />
</Form>;
```
