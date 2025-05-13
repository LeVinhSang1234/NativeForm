import {
  createContext,
  MemoExoticComponent,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
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
  ) => void;
  unmountField: (name: string) => void;
  fields: TField;
  setLayout: (name: string, rect: LayoutRectangle) => void;
  setValue: (name: string, value: any) => void;
  values: Record<string, any>;
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
  values: {},
  setValue: () => null,
  setLayout: () => null,
});

export const useFormContext = () => useContext(FormContext);

function unflattenObject(obj: Record<string, any>) {
  const result: any = {};
  for (const flatKey in obj) {
    const parts = flatKey
      .split('.')
      .map(k => (k.match(/^\d+$/) ? Number(k) : k));
    let curr = result;
    for (let i = 0; i < parts.length; i++) {
      const key = parts[i];
      if (i === parts.length - 1) {
        curr[key] = obj[flatKey];
      } else {
        if (curr[key] === undefined) {
          curr[key] = typeof parts[i + 1] === 'number' ? [] : {};
        }
        curr = curr[key];
      }
    }
  }
  return result;
}

function flattenObject(obj: any, prefix = '', res: Record<string, any> = {}) {
  if (typeof obj !== 'object' || obj === null) {
    res[prefix] = obj;
    return res;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      flattenObject(item, prefix ? `${prefix}.${i}` : `${i}`, res);
    });
  } else {
    Object.keys(obj).forEach(key => {
      flattenObject(obj[key], prefix ? `${prefix}.${key}` : key, res);
    });
  }
  return res;
}

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
  const touched = useRef<{[key: string]: boolean}>({});
  const layout = useRef<{[key: string]: LayoutRectangle}>({});

  const _values = useMemo(
    () => ({...initialValues, ...flattenObject(initialValues)}),
    [initialValues],
  );

  const values = useRef<{[key: string]: TItemValue}>(
    Object.keys(_values).reduce((a, b) => {
      a[b] = {value: _values[b]};
      return a;
    }, {} as {[key: string]: TItemValue}),
  );

  const setField = useCallback(
    (name: string, field: Omit<FormItem, 'name' | 'children'>) => {
      if (fields.current[name]?.preserve && !field.preserve) {
        delete values.current?.[name];
        delete touched.current?.[name];
      }
      fields.current[name] = field;
    },
    [],
  );

  const setLayout = useCallback((name: string, rect: LayoutRectangle) => {
    layout.current[name] = rect;
  }, []);

  const setValue = useCallback(
    (name: string, value: any) => {
      if (!values.current) values.current = {};
      values.current[name] = value;
      if (!touched.current[name]) touched.current[name] = true;
      if (touched.current[name]) onValuesChange?.(values.current);
    },
    [onValuesChange],
  );

  const unmountField = useCallback((name: string) => {
    delete layout.current[name];
    if (fields.current?.[name]?.preserve) return;
    delete values.current?.[name];
    delete fields.current?.[name];
    delete touched.current?.[name];
  }, []);

  const getFieldError = useCallback((name: any) => {
    if (values.current[name]?.error) return values.current[name]?.error;
    const prefix = name + '.';
    const errors: Record<string, string> = {};
    Object.keys(values.current).forEach(key => {
      if (key.startsWith(prefix) && values.current[key]?.error) {
        errors[key] = values.current[key].error;
      }
    });
    if (Object.keys(errors).length === 0) return undefined;
    return errors;
  }, []);

  const getFieldsError = useCallback(
    async (
      names: any[] = Object.keys(fields),
    ): Promise<{[key: string]: string | undefined}> => {
      const errors: {[key: string]: string | undefined} = {};
      names.forEach(name => {
        if (values.current[name]?.error) {
          errors[name] = values.current[name]?.error;
        }
        const prefix = name + '.';
        Object.keys(values.current).forEach(key => {
          if (key.startsWith(prefix) && values.current[key]?.error) {
            errors[key] = values.current[key].error;
          }
        });
      });
      return errors;
    },
    [],
  );

  const getFieldsValue = useCallback(
    (names?: any[], filter?: FilterGetValues) => {
      let keys: string[];
      if (!names) {
        keys = Object.keys(fields);
      } else {
        keys = [];
        names.forEach(name => {
          if (values.current[name] !== undefined) keys.push(name);
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
      return unflattenObject(flat);
    },
    [],
  );

  const getFieldValue = useCallback((name: any) => {
    if (values.current[name]?.value !== undefined) {
      return values.current[name]?.value;
    }
    const prefix = name + '.';
    const flat: Record<string, any> = {};
    Object.keys(values.current).forEach(key => {
      if (key.startsWith(prefix)) {
        flat[key] = values.current[key]?.value;
      }
    });
    if (Object.keys(flat).length === 0) return undefined;
    return unflattenObject(flat)[name];
  }, []);

  const setFieldError = useCallback((name: any, error?: string | false) => {
    values.current[name] = {...values.current[name], error: error || ''};
    fields.current[name]?.triggerState?.(values.current[name]);
  }, []);

  const isFieldsTouched = useCallback(
    (names: any[] = Object.keys(fields)): boolean => {
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

  const resetFields = useCallback(
    async (names: any[] = Object.keys(fields)) => {
      await Promise.all(
        names.map(async name => {
          values.current[name] = initialValues[name];
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

  // eslint-disable-next-line @typescript-eslint/no-shadow
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
      // eslint-disable-next-line @typescript-eslint/no-shadow
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
      return {values: unflattenObject(_values), errors: _errors} as any;
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
        values: values.current,
        setValue,
        setLayout,
      }}>
      {children}
    </FormContext.Provider>
  );
};

const ValuesContext = createContext<{
  values: Record<string, any>;
  onChangeValue: (name: string, value: any) => void;
}>({
  values: {},
  onChangeValue: () => null,
});

export const useValues = () => useContext(ValuesContext);

export const ValuesProvider = ({children}: PropsWithChildren) => {
  const {initialValues = {}} = useFormContext();
  const [values, setValues] = useState<Record<string, any>>(
    flattenObject(initialValues),
  );

  const onChangeValue = useCallback((name: string, value: any) => {
    setValues(pre => ({...pre, [name]: value}));
  }, []);

  return (
    <ValuesContext.Provider value={{values, onChangeValue}}>
      {children}
    </ValuesContext.Provider>
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
