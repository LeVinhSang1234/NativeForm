import {PropsWithChildren, useCallback, useRef} from 'react';
import {FormInstance, TForm} from './types';
import {FormProvider} from './provider';
import Item from './Item';
import {
  ScrollViewProps,
  StyleSheet,
  View,
  ScrollView as ScrollViewLibray,
} from 'react-native';

const methods: (keyof FormInstance)[] = [
  'getFieldError',
  'getFieldsError',
  'getFieldsValue',
  'getFieldValue',
  'isFieldsTouched',
  'isFieldTouched',
  'resetFields',
  'setFieldValue',
  'setFieldsValue',
  'validateFields',
  'setFieldError',
];

export const useForm = <T,>(): FormInstance<T> => {
  const form = methods.reduce((acc, method) => {
    // @ts-ignore
    acc[method] = () => null;
    return acc;
  }, {} as FormInstance<T>);

  return form;
};

const Form = <T,>({style, ...props}: PropsWithChildren<TForm<T>>) => {
  return (
    <View style={[styles.root, style]}>
      <FormProvider {...props} />
    </View>
  );
};

const ScrollView = <T,>({
  scrollViewProps,
  ...props
}: PropsWithChildren<
  Omit<TForm<T>, 'style'> & {scrollViewProps?: ScrollViewProps}
>) => {
  const refScroll = useRef<ScrollViewLibray>(null);

  const scrollTo = useCallback((y: number) => {
    refScroll.current?.scrollTo?.({animated: true, y});
  }, []);

  return (
    <ScrollViewLibray {...scrollViewProps} ref={refScroll}>
      <FormProvider {...props} scrollTo={scrollTo} />
    </ScrollViewLibray>
  );
};

Form.Item = Item;

Form.ScrollView = ScrollView;

const styles = StyleSheet.create({root: {width: '100%'}});

export default Form;
