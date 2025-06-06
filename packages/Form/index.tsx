import React, {forwardRef, useCallback, useRef, PropsWithChildren} from 'react';
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

export const useForm = <T,>(initialValues?: Partial<T>): FormInstance<T> => {
  const form = methods.reduce((acc, method) => {
    // @ts-ignore
    acc[method] = () => null;
    return acc;
  }, {} as FormInstance<T>);
  form.initialValues = initialValues;
  return form;
};

const Form = <T,>({style, ...props}: PropsWithChildren<TForm<T>>) => {
  return (
    <View style={[styles.root, style]}>
      <FormProvider
        {...props}
        initialValues={props.initialValues ?? props.form?.initialValues}
      />
    </View>
  );
};

const ScrollView = forwardRef<
  ScrollViewLibray,
  PropsWithChildren<Omit<TForm<any>, 'style'> & ScrollViewProps>
>(
  (
    {
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
    },
    ref,
  ) => {
    const innerRef = useRef<ScrollViewLibray>(null);
    React.useImperativeHandle(
      ref,
      () => innerRef.current as ScrollViewLibray,
      [],
    );

    const scrollTo = useCallback((y: number) => {
      innerRef.current?.scrollTo?.({animated: true, y});
    }, []);

    return (
      <ScrollViewLibray {...props} ref={innerRef}>
        <FormProvider
          form={form}
          colon={colon}
          initialValues={initialValues ?? form.initialValues}
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
  },
);

Form.Item = Item;

Form.ScrollView = ScrollView;

const styles = StyleSheet.create({root: {width: '100%'}});

export default Form;
