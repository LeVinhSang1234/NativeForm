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

export const useForm = <T = any,>(): FormInstance<T> => {
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
  form,
  colon,
  initialValues,
  labelAlign,
  name,
  preserve,
  requiredMark,
  requiredMarkStyle,
  requiredMarkPosition,
  validateMessages,
  validateTrigger,
  onValuesChange,
  errorStyle,
  labelStyle,
  children,
  ...props
}: PropsWithChildren<Omit<TForm<T>, 'style'> & ScrollViewProps>) => {
  const refScroll = useRef<ScrollViewLibray>(null);

  const scrollTo = useCallback((y: number) => {
    refScroll.current?.scrollTo?.({animated: true, y});
  }, []);

  return (
    <ScrollViewLibray {...props} ref={refScroll}>
      <FormProvider
        form={form}
        colon={colon}
        initialValues={initialValues}
        labelAlign={labelAlign}
        name={name}
        preserve={preserve}
        requiredMark={requiredMark}
        requiredMarkStyle={requiredMarkStyle}
        requiredMarkPosition={requiredMarkPosition}
        validateMessages={validateMessages}
        validateTrigger={validateTrigger}
        onValuesChange={onValuesChange}
        errorStyle={errorStyle}
        labelStyle={labelStyle}
        scrollTo={scrollTo}>
        {children}
      </FormProvider>
    </ScrollViewLibray>
  );
};

Form.Item = Item;

Form.ScrollView = ScrollView;

const styles = StyleSheet.create({root: {width: '100%'}});

export default Form;
