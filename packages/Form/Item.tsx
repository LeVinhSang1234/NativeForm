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

const Item = ({
  children,
  name,
  getValueProps = v => v,
  required,
  label,
  rules,
  validateTrigger,
  preserve: _preserve,
  initialValue,
}: FormItem) => {
  const {
    setField,
    unmountField,
    values = {},
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
    value: initialValue ?? values[name]?.value,
  });

  useEffect(() => {
    if (typeof name !== 'string') return;
    setField(name, {...props, triggerState: _setValue});
    return () => {
      unmountField(name);
    };
  }, [name, props, setField, unmountField]);

  useEffect(() => {
    if (values[name]?.value === _value.value) return;
    _setValue({value: values[name]?.value});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, values]);

  const onChangeValue = useCallback(
    async (v: any) => {
      _setValue(pre => ({...pre, value: getValueProps(v)}));
      const _error = await validate(v, props, TriggerAction.onChange);
      _setValue({value: getValueProps(v), error: _error?.[0] as string});
    },
    [props, getValueProps],
  );

  useEffect(() => {
    const {value, error} = values[name] || {};
    if (value === _value.value && error === _value.error) return;
    setValue(name, _value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_value, name]);

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
      style={styles.root}
      onLayout={({nativeEvent}) => setLayout(name, nativeEvent.layout)}>
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

export default memo(Item);
