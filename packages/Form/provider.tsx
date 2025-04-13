import {
  createContext,
  MemoExoticComponent,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
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
  TFormContext<Omit<TForm, 'form' | 'children'>>
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
  const values = useRef<{[key: string]: TItemValue}>(
    Object.keys(initialValues).reduce((a, b) => {
      a[b] = {value: initialValues[b]};
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
    return values.current[name]?.error;
  }, []);

  const getFieldsError = useCallback(
    async (
      names: any[] = Object.keys(fields),
    ): Promise<{[key: string]: string | undefined}> => {
      return names?.reduce((a, b) => {
        if (values.current[b]?.error) a[b] = values.current[b]?.error;
        return a;
      }, {} as {[key: string]: string | undefined});
    },
    [],
  );

  const getFieldsValue = useCallback(
    (names?: any[], filter?: FilterGetValues) => {
      let keys = names ?? Object.keys(fields);
      if (typeof filter === 'function') {
        keys = keys.filter(e => filter(touched.current[e]));
      }
      return keys?.reduce((a, b) => {
        a[b] = values.current[b]?.value;
        return a;
      }, {} as {[key: string]: string | undefined});
    },
    [],
  );

  const getFieldValue = useCallback((name: any) => {
    return values.current[name]?.value;
  }, []);

  const setFieldError = useCallback((name: any, error?: string | false) => {
    values.current[name] = {...values.current[name], error: error || ''};
    fields.current[name]?.triggerState?.(values.current[name]);
  }, []);

  const isFieldsTouched = useCallback(
    (names: any[] = Object.keys(fields)): boolean => {
      return names.every(n => touched.current[n]);
    },
    [],
  );

  const isFieldTouched = useCallback((name: any): boolean => {
    return touched.current[name];
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
      if (scrollTo) {
        const y = layout.current[errs.filter(Boolean)[0]]?.y;
        scrollTo?.(y);
      }
      return {values: _values, errors: _errors} as any;
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
  const [values, setValues] = useState<Record<string, any>>(initialValues);

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
