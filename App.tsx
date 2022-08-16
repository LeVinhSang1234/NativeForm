import React, {useEffect} from 'react';
import {Button, SafeAreaView, StyleSheet} from 'react-native';
import Form, {Input, Radio, RadioGroup} from './packages';

const App = () => {
  const form = Form.useForm();

  useEffect(() => {
    Form.fastRefresh();
    return Form.unMount;
  });

  return (
    <SafeAreaView style={styles.view}>
      <Form initialValues={{login: ''}}>
        <Form.Item name="login" label="Login" validateFirst required>
          <Input placeholder="112121" />
        </Form.Item>
        <Form.ScrollView>
          <Form.Item
            name="login"
            initialValue="12"
            label="Login1"
            rules={[{whitespace: true}, {enum: [1, 2]}]}
            valuePropName="number">
            <Input placeholder="2" />
          </Form.Item>
          <Form.Item name="login" label="Login1" rules={[{whitespace: true}]}>
            <Input placeholder="2" />
          </Form.Item>
          <Form.Item name="login2.d" label="Login2" required validateFirst>
            <RadioGroup>
              <Radio value={1} label="radio 1" />
              <Radio value={2} label="radio 2" />
              <Radio value={3} label="radio 3" />
            </RadioGroup>
          </Form.Item>
          <Form.Item name="checkbox" label="checkbox">
            <Radio label="radio 1" />
          </Form.Item>
        </Form.ScrollView>
      </Form>
      <Button
        title="hahaha"
        onPress={async () => {
          const data = await form.validateFields();
          console.log('data =====>', data);
        }}
      />
    </SafeAreaView>
  );
};

// class App extends Component<{form: FormInstance}> {
//   render() {
//     const {form} = this.props;
//     return (
//       <SafeAreaView style={styles.view}>
//         <Form initialValues={{login: ''}}>
//           <Form.Item name="login" label="Login" validateFirst required>
//             <Input placeholder="1" />
//           </Form.Item>
//         </Form>
//         <Form>
//           <Form.Item
//             name="login"
//             label="Login1"
//             rules={[{whitespace: true}, {enum: [1, 2]}]}
//             valuePropName="number">
//             <Input placeholder="2" />
//           </Form.Item>
//           <Form.Item name="login" label="Login1" rules={[{whitespace: true}]}>
//             <Input placeholder="2" />
//           </Form.Item>
//           <Form.Item
//             name="login2"
//             label="Login2"
//             required
//             validateFirst
//             rules={[{required: true, message: 'asdasds'}]}>
//             <RadioGroup>
//               <Radio value={1} label="radio 1" />
//               <Radio value={2} label="radio 2" />
//               <Radio value={3} label="radio 3" />
//             </RadioGroup>
//           </Form.Item>
//           <Form.Item name="checkbox" label="checkbox">
//             <Radio label="radio 1" />
//           </Form.Item>
//           <Form.Item name="login3" label="Login3">
//             <Input placeholder="4" />
//           </Form.Item>
//           <Form.Item name="login4" label="Login4">
//             <Input placeholder="5" />
//           </Form.Item>
//         </Form>
//         <Button
//           title="hahaha"
//           onPress={async () => {
//             const data = await form.validateFields();
//             console.log('data =====>', data);
//           }}
//         />
//       </SafeAreaView>
//     );
//   }
// }

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

export default Form.create(App);
