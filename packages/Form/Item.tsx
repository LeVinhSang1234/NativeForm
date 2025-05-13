import {
  cloneElement,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {FormItem, TItemValue, TriggerAction} from './types';
import {useFormContext, useFormContextGlobal} from './provider';
import {validate} from './validateItem';
import {StyleSheet, Text as TextLibrary, View} from 'react-native';
import TextError from './TextError';

function getNestedValue(obj: Record<string, any>, path: string) {
  return path.split('.').reduce((acc, key) => {
    if (acc == null) return undefined;
    // Nếu key là số, chuyển thành index mảng
    const idx = Number(key);
    if (!isNaN(idx) && Array.isArray(acc)) {
      return acc[idx];
    }
    return acc[key];
  }, obj);
}

const Item = <T = any, K extends keyof T = keyof T>({
  children,
  name,
  getValueProps = v => v,
  required,
  label,
  rules,
  validateTrigger,
  preserve: _preserve,
  initialValue,
  style,
}: FormItem<T, K>) => {
  const {
    setField,
    unmountField,
    initialValues = {},
    setValue,
    errorStyle,
    labelAlign,
    labelStyle,
    requiredMarkPosition: pos = 'after',
    requiredMark = true,
    requiredMarkStyle,
    colon,
    preserve,
    setLayout,
  } = useFormContext();

  const {Text = TextLibrary} = useFormContextGlobal();

  const props = useMemo(
    () => ({
      rules,
      required,
      name,
      label,
      validateTrigger,
      preserve: _preserve ?? preserve,
    }),
    [rules, required, name, label, validateTrigger, _preserve, preserve],
  );

  const [_value, _setValue] = useState<TItemValue>({
    value: initialValue ?? getNestedValue(initialValues, name as string),
  });

  useEffect(() => {
    if (typeof name !== 'string') return;
    setField(name, {...props, triggerState: _setValue}, _value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props, setField, unmountField]);

  useEffect(() => {
    if (typeof name !== 'string') return;
    const nV = {
      value: initialValue ?? getNestedValue(initialValues, name as string),
    };
    _setValue(nV);
    setField(name, {...props, triggerState: _setValue}, nV);
    return () => {
      unmountField(name);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const onChangeValue = useCallback(
    async (v: any) => {
      _setValue(pre => ({...pre, value: getValueProps(v)}));
      const _error = await validate(v, props, TriggerAction.onChange);
      _setValue({value: getValueProps(v), error: _error?.[0] as string});
    },
    [props, getValueProps],
  );

  useEffect(() => {
    setValue(name as string, _value);
  }, [_value, name, setValue]);

  const onBlur = useCallback(async () => {
    const _error = await validate(_value.value, props, TriggerAction.onBlur);
    if (!_error) return;
    _setValue(pre => ({...pre, error: _error?.[0] as string}));
  }, [_value.value, props]);

  const _required = useMemo(() => {
    return required || rules?.some(e => e.required);
  }, [required, rules]);

  const mark = useMemo(() => {
    if (requiredMark === undefined || requiredMark === true) {
      return '*';
    }
    return requiredMark;
  }, [requiredMark]);

  const _children = useMemo(() => {
    if (typeof children === 'function') {
      return children({onChangeValue, onBlur, ..._value});
    }
    return cloneElement(children as any, {..._value, onChangeValue, onBlur});
  }, [_value, children, onBlur, onChangeValue]);

  return (
    <View
      style={[styles.root, style]}
      onLayout={({nativeEvent}) =>
        setLayout(name as string, nativeEvent.layout)
      }>
      {label ? (
        <Text style={[styles.label, {textAlign: labelAlign}, labelStyle]}>
          {pos === 'before' && _required && mark ? (
            <Text style={[styles.mark, requiredMarkStyle]}>{`${mark} `}</Text>
          ) : null}
          {label}
          {pos === 'after' && _required && mark ? (
            <Text style={[styles.mark, requiredMarkStyle]}>{` ${mark}`}</Text>
          ) : null}
          {colon ?? ''}
        </Text>
      ) : null}
      {_children}
      <TextError error={_value.error} errorStyle={errorStyle} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {position: 'relative', height: 'auto', width: '100%'},
  label: {fontSize: 14, marginBottom: 4, fontWeight: '500'},
  mark: {color: '#ff0000', fontSize: 14},
});

export default memo(Item) as unknown as typeof Item;
