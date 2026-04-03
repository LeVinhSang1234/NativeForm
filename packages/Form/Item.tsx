import {
  cloneElement,
  memo,
  useCallback,
  useEffect,
  useMemo,
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
  normalize,
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
      normalize,
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
      normalize,
    ],
  );

  const getInitial = useCallback(
    () => initialValue ?? (getNestedValue(initialValues, nameStr) as any),
    [initialValue, initialValues, nameStr],
  );

  const [itemValue, setItemValue] = useState<TItemValue>({
    value: getInitial(),
  });

  useEffect(() => {
    if (typeof name !== 'string') return;
    setField(name, {...props, triggerState: setItemValue});
  }, [name, props, setField]);

  useEffect(() => {
    if (typeof name !== 'string') return;
    const v = {value: getInitial()};
    setItemValue(v);
    setValue(nameStr, v);
  }, [getInitial, name, nameStr, setValue]);

  useEffect(() => {
    return () => {
      unmountField(nameStr);
    };
  }, [nameStr, unmountField]);

  const onChangeValue = useCallback(
    async (v: any) => {
      const normalized = normalize ? normalize(v) : v;
      const next = {value: normalized};
      setItemValue(next);
      setValue(nameStr, next, true);
      const errors = await validate(
        normalized,
        props,
        TriggerAction.onChange,
        validateMessages,
      );
      const final = {value: normalized, error: errors?.[0] as string};
      setItemValue(final);
      setValue(nameStr, final, true);
    },
    [normalize, props, validateMessages, nameStr, setValue],
  );

  const onBlur = useCallback(async () => {
    const errors = await validate(
      itemValue.value,
      props,
      TriggerAction.onBlur,
      validateMessages,
    );
    if (!errors) return;
    const next = {...itemValue, error: errors?.[0] as string};
    setItemValue(next);
    setValue(nameStr, next);
  }, [itemValue, props, validateMessages, nameStr, setValue]);

  const isRequired = useMemo(() => {
    return required || rules?.some(rule => rule.required);
  }, [required, rules]);

  const mark = useMemo(() => {
    return requiredMark === true ? '*' : requiredMark;
  }, [requiredMark]);

  const renderedChildren = useMemo(() => {
    const v = getValueProps(itemValue.value);

    if (typeof children === 'function') {
      return children({onChangeValue, onBlur, ...itemValue, value: v});
    }
    return cloneElement(children as any, {
      ...itemValue,
      value: v,
      onChangeValue,
      onBlur,
    });
  }, [children, itemValue, onChangeValue, onBlur, getValueProps]);

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
