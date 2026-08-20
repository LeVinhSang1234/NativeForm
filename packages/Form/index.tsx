import React, {forwardRef, useCallback, useRef, PropsWithChildren} from 'react';
import {defaultKeyboardManager, FormInstance, TForm} from './types';
import {FormProvider, useFormContextGlobal} from './provider';
import Item from './Item';
import {
  Platform,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  ScrollView as ScrollViewLibrary,
} from 'react-native';
import KeyboardManagerView from './RNFormKeyboardManagerNativeComponent';

const methods: (keyof FormInstance)[] = [
  'getFieldError',
  'getFieldsError',
  'getFieldsValue',
  'getFieldValue',
  'isFieldsTouched',
  'isFieldTouched',
  'isValuesChanged',
  'resetFields',
  'setFieldValue',
  'setFieldsValue',
  'setInitFieldsValue',
  'validateFields',
  'setFieldError',
  'clearTouched',
];

let formId = 0;

const KeyboardManager = ({
  style,
  children,
}: PropsWithChildren<{style?: StyleProp<ViewStyle>}>) => {
  const {keyboardManager} = useFormContextGlobal();
  // Android keeps the focused input visible through windowSoftInputMode, there
  // is no native view to mount there.
  if (Platform.OS !== 'ios') {
    return <View style={style}>{children}</View>;
  }
  const config = {...defaultKeyboardManager, ...keyboardManager};
  return (
    <KeyboardManagerView
      enabled
      distance={config.distance}
      toolbar={config.toolbar}
      toolbarDoneText={config.toolbarDoneText}
      toolbarPreviousNext={config.toolbarPreviousNext}
      toolbarPlaceholder={config.toolbarPlaceholder}
      toolbarTintColor={config.toolbarTintColor}
      toolbarBarTintColor={config.toolbarBarTintColor}
      keyboardAppearance={config.keyboardAppearance}
      style={style}>
      {children}
    </KeyboardManagerView>
  );
};

export const useForm = <T,>(initialValues?: Partial<T>): FormInstance<T> => {
  const formRef = useRef<FormInstance<T> | null>(null);
  if (!formRef.current) {
    const instance = {} as FormInstance<T>;
    formRef.current = methods.reduce((acc, method) => {
      // @ts-ignore
      acc[method] = async (...args: any[]) => {
        await acc.isReady();
        // @ts-ignore
        return acc[method](...args);
      };
      return acc;
    }, instance);
    formRef.current.id = ++formId;
    formRef.current._ready = false;
    formRef.current.isReady = (timeout = 10000) =>
      new Promise<void>((resolve, reject) => {
        if (formRef.current?._ready) return resolve();
        const interval = 50;
        let elapsed = 0;
        const timer = setInterval(() => {
          elapsed += interval;
          if (formRef.current?._ready) {
            clearInterval(timer);
            return resolve();
          }
          if (elapsed >= timeout) {
            clearInterval(timer);
            return reject(
              new Error(
                `Form #${formRef.current?.id} is not ready after ${timeout}ms`,
              ),
            );
          }
        }, interval);
      });
    formRef.current.initialValues = initialValues;
  }
  return formRef.current;
};

const Form = <T,>({
  style,
  keyboardManager,
  ...props
}: PropsWithChildren<TForm<T>>) => {
  const {
    requiredMark,
    requiredMarkPosition,
    requiredMarkStyle,
    errorStyle,
    labelStyle,
    validateMessages,
  } = useFormContextGlobal();
  const content = (
    <FormProvider
      requiredMark={requiredMark}
      requiredMarkPosition={requiredMarkPosition}
      requiredMarkStyle={requiredMarkStyle}
      errorStyle={errorStyle}
      labelStyle={labelStyle}
      validateMessages={validateMessages}
      {...props}
      initialValues={props.initialValues ?? props.form?.initialValues}
    />
  );

  if (keyboardManager) {
    return (
      <KeyboardManager style={[styles.root, style]}>{content}</KeyboardManager>
    );
  }

  return <View style={[styles.root, style]}>{content}</View>;
};

const ScrollView = forwardRef<
  ScrollViewLibrary,
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
      keyboardManager,
      children,
      onFormDispose,
      ...props
    },
    ref,
  ) => {
    const innerRef = useRef<ScrollViewLibrary>(null);
    React.useImperativeHandle(
      ref,
      () => innerRef.current as ScrollViewLibrary,
      [],
    );

    const {
      requiredMark: _requiredMark,
      requiredMarkPosition: _requiredMarkPosition,
      requiredMarkStyle: _requiredMarkStyle,
      errorStyle: _errorStyle,
      labelStyle: _labelStyle,
      validateMessages: _validateMessages,
    } = useFormContextGlobal();

    const scrollTo = useCallback((y: number) => {
      innerRef.current?.scrollTo?.({animated: true, y});
    }, []);

    const content = (
      <FormProvider
        onFormDispose={onFormDispose}
        form={form}
        colon={colon}
        initialValues={initialValues ?? form.initialValues}
        labelAlign={labelAlign}
        name={name}
        preserve={preserve}
        requiredMark={requiredMark ?? _requiredMark}
        requiredMarkStyle={requiredMarkStyle ?? _requiredMarkStyle}
        requiredMarkPosition={requiredMarkPosition ?? _requiredMarkPosition}
        validateMessages={validateMessages ?? _validateMessages}
        validateTrigger={validateTrigger}
        onValuesChange={onValuesChange}
        errorStyle={errorStyle ?? _errorStyle}
        labelStyle={labelStyle ?? _labelStyle}
        scrollTo={scrollTo}>
        {children}
      </FormProvider>
    );

    return (
      <ScrollViewLibrary {...props} ref={innerRef}>
        {keyboardManager ? (
          <KeyboardManager style={styles.root}>{content}</KeyboardManager>
        ) : (
          content
        )}
      </ScrollViewLibrary>
    );
  },
);

Form.Item = Item;

Form.ScrollView = ScrollView;

const styles = StyleSheet.create({root: {width: '100%'}});

export default Form;
