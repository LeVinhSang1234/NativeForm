import {
  createContext,
  MemoExoticComponent,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import {
  defaultValidateMessages,
  TField,
  TForm,
  TriggerAction,
  FormItem,
  FormInstance,
  FilterGetValues,
  TItemValue,
} from './types';
import {validate} from './validateItem';
import {LayoutRectangle} from 'react-native';

export type TFormContext<T> = {
  setField: (
    name: string,
    field: Omit<FormItem, 'name' | 'children'> & {
      triggerState: React.Dispatch<React.SetStateAction<TItemValue>>;
    },
    value?: TItemValue,
  ) => void;
  unmountField: (name: string) => void;
  fields: TField;
  setLayout: (name: string, rect: LayoutRectangle) => void;
  setValue: (name: string, value: any) => void;
  initialValues: Record<string, any>;
} & T;

const FormContext = createContext<
  TFormContext<Omit<TForm, 'form' | 'children' | 'style'>>
>({
  setField: () => null,
  unmountField: () => null,
  fields: {},
  colon: true,
  labelAlign: 'left',
  requiredMark: true,
  validateMessages: defaultValidateMessages,
  validateTrigger: TriggerAction.onChange,
  initialValues: {},
  setValue: () => null,
  setLayout: () => null,
});

export const useFormContext = () => useContext(FormContext);

const toNestedObject = (flat: Record<string, any>) => {
  const result: Record<string, any> = {};
  Object.keys(flat).forEach(flatKey => {
    const parts = flatKey
      .split('.')
      .map(k => (k.match(/^\d+$/) ? Number(k) : k));
    let cursor: any = result;
    parts.forEach((key, idx) => {
      const isLeaf = idx === parts.length - 1;
      if (isLeaf) {
        cursor[key] = flat[flatKey];
        return;
      }
      if (cursor[key] === undefined) {
        cursor[key] = typeof parts[idx + 1] === 'number' ? [] : {};
      }
      cursor = cursor[key];
    });
  });
  return result;
};

const getInitialValueByPath = (
  source: Record<string, any>,
  path: string,
): any =>
  path.split('.').reduce((acc: any, key) => {
    if (acc == null) return undefined;
    const idx = Number(key);
    if (!Number.isNaN(idx) && Array.isArray(acc)) {
      return acc[idx];
    }
    return acc[key];
  }, source);

export const FormProvider = ({
  children,
  form,
  initialValues = {},
  scrollTo,
  onValuesChange,
  ...p
}: PropsWithChildren<
  TForm & {form: FormInstance<any>; scrollTo?: (y: number) => void}
>) => {
  const fields = useRef<TField>({});
  const touched = useRef<Record<string, boolean>>({});
  const layout = useRef<Record<string, LayoutRectangle>>({});
  const values = useRef<Record<string, TItemValue>>({});
  const changeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setValue = useCallback(
    (name: string, value: TItemValue) => {
      const prevValue = values.current[name]?.value;
      const hasValueChanged = prevValue !== value?.value;
      values.current[name] = value;
      if (!touched.current[name]) touched.current[name] = true;
      if (!hasValueChanged) return;
      if (changeTimeout.current) clearTimeout(changeTimeout.current);
      changeTimeout.current = setTimeout(() => {
        if (touched.current[name]) onValuesChange?.(values.current);
      }, 150);
    },
    [onValuesChange],
  );

  const setField = useCallback(
    (
      name: string,
      field: Omit<FormItem, 'name' | 'children'>,
      value?: TItemValue,
    ) => {
      if (fields.current[name]?.preserve && !field.preserve) {
        delete values.current?.[name];
        delete touched.current?.[name];
      }
      fields.current[name] = field;
      if (value !== undefined) values.current[name] = value;
    },
    [],
  );

  const setLayout = useCallback((name: string, rect: LayoutRectangle) => {
    layout.current[name] = rect;
  }, []);

  const unmountField = useCallback((name: string) => {
    delete layout.current[name];
    if (fields.current?.[name]?.preserve) return;
    delete values.current?.[name];
    delete fields.current?.[name];
    delete touched.current?.[name];
  }, []);

  const getFieldError = useCallback((name: any) => {
    if (values.current[name]?.error) {
      return values.current[name]?.error;
    }
    const prefix = `${name}.`;
    const errors: Record<string, string> = {};
    Object.keys(values.current).forEach(key => {
      const itemError = values.current[key]?.error;
      if (key.startsWith(prefix) && itemError) {
        errors[key] = itemError as string;
      }
    });
    return Object.keys(errors).length === 0 ? undefined : errors;
  }, []);

  const getFieldsError = useCallback(
    async (
      names: any[] = Object.keys(fields.current),
    ): Promise<{[key: string]: string | undefined}> => {
      const errors: {[key: string]: string | undefined} = {};
      names.forEach(name => {
        const currentError = values.current[name]?.error;
        if (currentError) errors[name] = currentError;
        const prefix = `${name}.`;
        Object.keys(values.current).forEach(key => {
          const itemError = values.current[key]?.error;
          if (key.startsWith(prefix) && itemError) {
            errors[key] = itemError;
          }
        });
      });
      return errors;
    },
    [],
  );

  const getFieldsValue = useCallback(
    async (names?: any[], filter?: FilterGetValues) => {
      let keys: string[];
      if (!names) {
        keys = Object.keys(fields.current);
      } else {
        keys = [];
        names.forEach(name => {
          if (values.current[name] !== undefined) {
            keys.push(name);
          }
          Object.keys(values.current).forEach(key => {
            if (key.startsWith(name + '.') && !keys.includes(key)) {
              keys.push(key);
            }
          });
        });
      }
      if (typeof filter === 'function') {
        keys = keys.filter(e => filter(touched.current[e]));
      }
      const flat: Record<string, any> = keys.reduce((a, b) => {
        a[b] = values.current[b]?.value;
        return a;
      }, {} as Record<string, any>);
      return toNestedObject(flat);
    },
    [],
  );

  const getFieldValue = useCallback((name: any) => {
    if (values.current[name]?.value !== undefined) {
      return values.current[name]?.value;
    }
    const prefix = `${name}.`;
    const flat: Record<string, any> = {};
    Object.keys(values.current).forEach(key => {
      if (key.startsWith(prefix)) {
        flat[key] = values.current[key]?.value;
      }
    });
    if (Object.keys(flat).length === 0) return undefined;
    return toNestedObject(flat)[name];
  }, []);

  const setFieldError = useCallback((name: any, error?: string | false) => {
    values.current[name] = {...values.current[name], error: error || ''};
    fields.current[name]?.triggerState?.(values.current[name]);
  }, []);

  const isFieldsTouched = useCallback(
    (names: any[] = Object.keys(fields.current)): boolean => {
      let allKeys: string[] = [];
      names.forEach(name => {
        if (touched.current[name] !== undefined) allKeys.push(name);
        Object.keys(fields.current).forEach(key => {
          if (key.startsWith(name + '.') && !allKeys.includes(key)) {
            allKeys.push(key);
          }
        });
      });
      if (allKeys.length === 0) return false;
      return allKeys.every(n => touched.current[n]);
    },
    [],
  );

  const isFieldTouched = useCallback((name: any): boolean => {
    if (touched.current[name]) return true;
    const prefix = name + '.';
    return Object.keys(fields.current)
      .filter(e => e.startsWith(prefix))
      .some(key => touched.current[key]);
  }, []);

  const isValuesChanged = useCallback(
    (names: any[] = Object.keys(fields.current)) => {
      return names.some(name => {
        const currentValue = values.current[name]?.value;
        const initialValue = getInitialValueByPath(initialValues, name);
        return currentValue !== initialValue;
      });
    },
    [initialValues],
  );

  const resetFields = useCallback(
    async (names: any[] = Object.keys(fields.current)) => {
      await Promise.all(
        names.map(async name => {
          values.current[name] = initialValues[name];
          if (touched.current[name]) delete touched.current[name];
          return fields.current[name]?.triggerState?.({
            value: initialValues[name],
          });
        }),
      );
    },
    [initialValues],
  );

  const setFieldValue = useCallback((name: any, value: any) => {
    values.current[name] = {value};
  }, []);

  const setFieldsValue = useCallback(async (_values: {[key: string]: any}) => {
    await Promise.all(
      Object.keys(_values).map(async name => {
        values.current[name] = _values[name];
        return fields.current[name]?.triggerState?.({
          value: _values[name],
        });
      }),
    );
  }, []);

  const validateFields = useCallback(
    async (names: any[] = Object.keys(fields.current)) => {
      const _values: {[key: string]: any} = {};
      let _errors: {[key: string]: string | undefined} | undefined;
      const errs = await Promise.all(
        names.map(async name => {
          const field = fields.current[name];
          const error = await validate(
            values.current[name]?.value,
            {...field, name},
            TriggerAction.all,
          );
          _values[name] = values.current[name]?.value;
          if (error?.[0]) {
            if (!_errors) _errors = {};
            _errors[name] = error?.[0];
          }
          values.current[name] = {value: _values[name], error: _errors?.[name]};
          fields.current[name]?.triggerState?.(values.current[name]);
          if (_errors?.[name]) return name;
        }),
      );
      if (scrollTo && errs.filter(Boolean)[0]) {
        const y = layout.current[errs.filter(Boolean)[0]]?.y;
        scrollTo?.(y);
      }
      return {values: toNestedObject(_values), errors: _errors} as any;
    },
    [scrollTo],
  );

  useEffect(() => {
    form.getFieldError = getFieldError;
    form.getFieldsError = getFieldsError;
    form.getFieldsValue = getFieldsValue;
    form.getFieldValue = getFieldValue;
    form.isFieldsTouched = isFieldsTouched;
    form.isFieldTouched = isFieldTouched;
    form.isValuesChanged = isValuesChanged;
    form.resetFields = resetFields;
    form.setFieldValue = setFieldValue;
    form.setFieldsValue = setFieldsValue;
    form.validateFields = validateFields;
    form.setFieldError = setFieldError;
  }, [
    form,
    getFieldError,
    getFieldValue,
    getFieldsError,
    getFieldsValue,
    isFieldTouched,
    isFieldsTouched,
    isValuesChanged,
    resetFields,
    setFieldError,
    setFieldValue,
    setFieldsValue,
    validateFields,
  ]);

  return (
    <FormContext.Provider
      value={{
        ...p,
        fields: fields.current,
        setField,
        unmountField,
        initialValues,
        setValue,
        setLayout,
      }}>
      {children}
    </FormContext.Provider>
  );
};

type GlobalContext = {
  Text?:
    | ((v: any) => React.JSX.Element)
    | MemoExoticComponent<(v: any) => React.JSX.Element>;
};

export const FormContextGlobal = createContext<GlobalContext>({});

export const useFormContextGlobal = () => useContext(FormContextGlobal);

export const FormGlobalProvider = ({
  children,
  Text,
}: PropsWithChildren<GlobalContext>) => {
  return (
    <FormContextGlobal.Provider value={{Text}}>
      {children}
    </FormContextGlobal.Provider>
  );
};
