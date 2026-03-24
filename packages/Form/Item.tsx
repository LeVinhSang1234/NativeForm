import {
  cloneElement,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {FormItem, TItemValue, TriggerAction} from './types';
import {getNestedValue, useFormContext, useFormContextGlobal} from './provider';
import {validate} from './validateItem';
import {StyleSheet, Text as TextLibrary, View} from 'react-native';
import TextError from './TextError';

const defaultGetValueProps = (v: any) => v;

const Item = <T = any, K extends keyof T = keyof T>({
  children,
  name,
  getValueProps: getValuePropsProp,
  required,
  label,
  rules,
  validateTrigger,
  preserve: itemPreserve,
  initialValue,
  style,
  errorStyle: itemErrorStyle,
  labelStyle: itemLabelStyle,
  messageError,
}: FormItem<T, K>) => {
  const getValueProps = getValuePropsProp ?? defaultGetValueProps;
  const {
    setField,
    unmountField,
    initialValues = {},
    setValue,
    errorStyle,
    labelAlign,
    labelStyle,
    requiredMarkPosition = 'after',
    requiredMark = true,
    requiredMarkStyle,
    colon,
    preserve,
    setLayout,
    validateMessages,
  } = useFormContext();

  const {Text = TextLibrary} = useFormContextGlobal();

  const nameStr = name as string;

  const props = useMemo(
    () => ({
      rules,
      required,
      name,
      label,
      validateTrigger,
      preserve: itemPreserve ?? preserve,
      messageError,
    }),
    [
      rules,
      required,
      name,
      label,
      validateTrigger,
      itemPreserve,
      preserve,
      messageError,
    ],
  );

  const getInitial = useCallback(
    () =>
      getValueProps(
        initialValue ?? (getNestedValue(initialValues, nameStr) as any),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nameStr],
  );

  const [itemValue, setItemValue] = useState<TItemValue>({
    value: getInitial(),
  });

  useEffect(() => {
    if (typeof name !== 'string') return;
    setField(name, {...props, triggerState: setItemValue}, itemValue);
  }, [itemValue, name, props, setField]);

  const mountedRef = useRef(false);
  useEffect(() => {
    if (typeof name !== 'string') return;
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    const newValue = {value: getInitial()};
    setItemValue(newValue);
    setField(name, {...props, triggerState: setItemValue}, newValue);
  }, [getInitial, name, props, setField]);

  useEffect(() => {
    return () => {
      unmountField(nameStr);
    };
  }, [nameStr, unmountField]);

  const onChangeValue = useCallback(
    async (v: any) => {
      setItemValue(prev => ({...prev, value: getValueProps(v)}));
      const errors = await validate(
        v,
        props,
        TriggerAction.onChange,
        validateMessages,
      );
      setItemValue(prev => ({
        ...prev,
        value: getValueProps(v),
        error: errors?.[0] as string,
      }));
    },
    [props, validateMessages, getValueProps],
  );

  useEffect(() => {
    setValue(nameStr, itemValue);
  }, [itemValue, nameStr, setValue]);

  const onBlur = useCallback(async () => {
    const errors = await validate(
      itemValue.value,
      props,
      TriggerAction.onBlur,
      validateMessages,
    );
    if (!errors) return;
    setItemValue(prev => ({...prev, error: errors?.[0] as string}));
  }, [itemValue.value, props, validateMessages]);

  const isRequired = useMemo(() => {
    return required || rules?.some(rule => rule.required);
  }, [required, rules]);

  const mark = useMemo(() => {
    return requiredMark === true ? '*' : requiredMark;
  }, [requiredMark]);

  const renderedChildren = useMemo(() => {
    if (typeof children === 'function') {
      return children({onChangeValue, onBlur, ...itemValue});
    }
    return cloneElement(children as any, {...itemValue, onChangeValue, onBlur});
  }, [itemValue, children, onBlur, onChangeValue]);

  return (
    <View
      style={[styles.root, style]}
      onLayout={({nativeEvent}) => setLayout(nameStr, nativeEvent.layout)}>
      {label ? (
        <Text
          style={[
            styles.label,
            {textAlign: labelAlign},
            labelStyle,
            itemLabelStyle,
          ]}>
          {requiredMarkPosition === 'before' && isRequired && mark ? (
            <Text style={[styles.mark, requiredMarkStyle]}>{`${mark} `}</Text>
          ) : null}
          {label}
          {requiredMarkPosition === 'after' && isRequired && mark ? (
            <Text style={[styles.mark, requiredMarkStyle]}>{` ${mark}`}</Text>
          ) : null}
          {colon ?? ''}
        </Text>
      ) : null}
      {renderedChildren}
      <TextError
        error={itemValue.error}
        errorStyle={[errorStyle, itemErrorStyle]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {position: 'relative', height: 'auto', width: '100%'},
  label: {fontSize: 14, marginBottom: 4, fontWeight: '500'},
  mark: {color: '#ff0000', fontSize: 14},
});

export default memo(Item) as unknown as typeof Item;
