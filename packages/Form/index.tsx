import React, {Component, useEffect, useMemo} from 'react';
import {createID} from '../utils';
import {
  Create,
  Form as FormTypes,
  ParamsOnChangeValue,
  TriggerAction,
  FormInstance,
  FieldData,
  FilterGetValues,
  ValueValidateField,
} from './types';
import Item from './Item';
import {validate} from './validateItem';
import {FormControlProvider, FormProps, FormValues} from '../provider';
import {ScrollView as ScrollViewLibrary, ScrollViewProps} from 'react-native';
import GarenateInitValue from './GarenateInitValue';

let formHandle: {[key: string]: FormInstance & {name?: string}} = {};
let controlRefresh: {
  [key: string]: {fastRefresh: () => any; unmount: () => any};
} = {};

const methods: (keyof FormInstance)[] = [
  'getFieldError',
  'getFieldsError',
  'getFieldsValue',
  'getFieldValue',
  'isFieldsTouched',
  'isFieldTouched',
  'isFieldValidating',
  'resetFields',
  'setFields',
  'setFieldValue',
  'setFieldsValue',
  'validateFields',
];

class Form<Type = Record<string, any>> extends GarenateInitValue<Type> {
  static contextType = FormValues;
  static Item: typeof Item;
  static ScrollView: typeof ScrollView;
  static create: Create;
  id: string;
  unmount: boolean;
  static useForm: <T = Record<string, any>>() => FormInstance<T>;

  constructor(props: FormTypes<Type>) {
    super(props);
    this.unmount = false;
    this.promises = [];
    this.promiseClears = [];
    this.promiseLayouts = [];
    this.id = createID(60);
    this.garenateInitForm();
    controlRefresh[this.id] = {
      unmount: async () => (this.unmount = true),
      fastRefresh: this.fastRefresh,
    };
  }

  UNSAFE_componentWillReceiveProps(nProps: FormTypes<Type>) {
    if (this.context) {
      delete formHandle[this.id];
    } else if (this.props.name !== nProps.name) {
      (formHandle[this.id] as any).name = nProps.name;
    }
  }

  private garenateInitForm() {
    const {form, name} = this.props;
    if (form) {
      for (const method of methods) {
        //@ts-ignore
        form[method] = this[method] as any;
      }
    } else if (!this.context) {
      formHandle[this.id] = {name} as any;
      for (const method of methods) {
        //@ts-ignore
        (formHandle[this.id] as any)[method] = this[method];
      }
    }
  }

  componentWillUnmount() {
    delete formHandle[this.id];
    delete controlRefresh[this.id];
  }

  private fastRefresh = async () => {
    const {initialValues = {}, form} = this.props;
    const {forceUpdate} = this.state;
    if (form) {
      const promise = methods.map(async method => {
        form[method] = (this as any)[method] as any;
      });
      Promise.all(promise);
    }
    if (this.unmount && (form || !this.context)) {
      if (Object.keys(initialValues).length) {
        this.setFieldsValue(initialValues, true);
        this.unmount = false;
      } else {
        this.setState({forceUpdate: !forceUpdate});
      }
    }
  };

  private getFieldError = async (name: string) => {
    const {errors} = this.state;
    return errors?.[name];
  };

  private getFieldsError = async (names?: string[]) => {
    const {errors, fields: fds} = this.state;
    let errs: {[key: string]: string | undefined} = {};
    const fields = names || Object.keys(fds || {});
    if (!Array.isArray(fields)) {
      return Promise.reject(
        'method getFieldsError allow params the names must be an array and of type string[]',
      );
    }
    const promise = fields.map(async field => {
      if (!field.includes('.')) {
        errs[field] = errors?.[field];
      } else {
        let errorParser: any = errs;
        field.split('.').map((k, i, arrs) => {
          errorParser = errorParser[k] =
            i === arrs.length - 1 ? errors?.[field] : errorParser[k] || {};
        });
      }
    });
    await Promise.all(promise);
    return errs;
  };

  private getFieldsValue = async (
    names?: string[],
    filter?: FilterGetValues,
  ) => {
    const {touched, validating, values, fields: fds} = this.state;
    let fields = names || Object.keys(fds || {});
    if (!Array.isArray(fields)) {
      return Promise.reject(
        'method getFieldsValue allow params the names must be an array and of type string[]',
      );
    }
    if (typeof filter === 'function') {
      fields = fields.filter(field =>
        filter({touched: touched[field], validating: validating[field]}),
      );
    }
    const value: {[key: string]: string | undefined} = {};
    const promise = fields.map(async field => {
      if (!field.includes('.')) {
        value[field] = values?.[field];
      } else {
        let valueParser: any = value;
        field.split('.').map((k, i, arrs) => {
          valueParser = valueParser[k] =
            i === arrs.length - 1 ? values?.[field] : valueParser[k] || {};
        });
      }
    });
    await Promise.all(promise);
    return value;
  };

  private getFieldValue = async (name: string) => {
    const {values} = this.state;
    return values?.[name];
  };

  private isFieldsTouched = async (names?: string[], allTouched?: boolean) => {
    const {touched, fields: fds} = this.state;
    const fields = names || Object.keys(fds || {});
    if (!Array.isArray(fields)) {
      return Promise.reject(
        'method isFieldsTouched allow params the names must be an array and of type string[]',
      );
    }
    if (allTouched) {
      return fields.every(field => touched?.[field]);
    }
    return fields.some(field => touched?.[field]);
  };

  private isFieldTouched = async (name: string) => {
    const {touched} = this.state;
    return !!touched?.[name];
  };

  private isFieldValidating = async (name: string) => {
    const {validating} = this.state;
    return !!validating?.[name];
  };

  private resetFields = async (names?: string[]) => {
    const {
      initialValues,
      touched,
      errors,
      validating,
      fields: fds,
    } = this.state;
    const fields = names || Object.keys(fds || {});
    const newValues: {[key: string]: any} = {};
    const promise = fields.map(async field => {
      newValues[field] = initialValues?.[field];
      delete touched[field];
      delete errors[field];
      delete validating[field];
      return null;
    });
    await Promise.all(promise);
    this.setState({values: newValues, errors, touched, validating});
  };

  private setFields = async (fields: FieldData[]) => {
    if (!Array.isArray(fields)) {
      return Promise.reject(
        'method setFields allow params the fields must be an array and of type string[]',
      );
    }
    const {values, errors, touched: t, validating: v} = this.state;
    const newValues: {[key: string]: any} = {};
    const errs: {[key: string]: string | undefined} = {};
    const validating: {[key: string]: boolean} = {};
    const touched: {[key: string]: boolean} = {};
    const promise = fields.map(async field => {
      newValues[field.name] = field.value;
      errors[field.name] = field.error;
      validating[field.name] =
        field.validating === undefined ? v?.[field.name] : field.validating;
      touched[field.name] =
        field.touched === undefined ? t?.[field.name] : field.touched;
    });
    await Promise.all(promise);
    this.setState({
      values: {...values, ...newValues},
      errors: {...errors, ...errs},
      touched: {...t, ...touched},
      validating: {...v, ...validating},
    });
  };

  private setFieldValue = async (name: string, value: string) => {
    const {fields, values, errors: errs} = this.state;
    const {validateMessages} = this.props;
    const errors = await validate(
      value,
      fields[name],
      TriggerAction.all,
      validateMessages,
    );
    this.setState({
      values: {...values, [name]: value},
      errors: {...errs, [name]: errors?.[0]},
    });
  };

  private setFieldsValue = async (
    values: {[key: string]: any},
    forceUpdate?: boolean,
  ) => {
    const {fields, values: vS, errors: errs, forceUpdate: force} = this.state;
    const {validateMessages} = this.props;
    let errors: {[key: string]: string | undefined} = {};
    const promises = Object.keys(values).map(async key => {
      return (
        fields[key] &&
        validate(
          values[key],
          fields[key],
          TriggerAction.all,
          validateMessages,
        ).then(errrs => {
          errors[key] = errrs?.[0];
        })
      );
    });
    await Promise.all(promises);
    this.setState({
      values: {...vS, ...values},
      errors: {...errs, ...errors},
      forceUpdate: forceUpdate ? !force : force,
    });
  };

  private validateFields = async (
    names?: string[],
  ): Promise<ValueValidateField> => {
    const {fields: fds, values, errors: errs, layouts} = this.state;
    const {validateMessages, scrollToError} = this.props;
    let fields = names || Object.keys(fds || {});
    if (!Array.isArray(fields)) {
      return Promise.reject(
        'method validateFields allow params the names must be an array and of type string[]',
      );
    }
    const newErrors = {...errs};
    const promises = fields.map(field => {
      if (!fds[field]) {
        return undefined;
      }
      return validate(
        values[field],
        fds[field],
        TriggerAction.all,
        validateMessages,
      ).then(errors => {
        if (!errors?.length) {
          return undefined;
        }
        if (!newErrors[field]) {
          newErrors[field] = errors?.[0];
        }
        return {
          [field]: {
            errors: errors?.filter(Boolean),
            layout: layouts[field],
          },
        };
      });
    });
    const errors: any = (await Promise.all(promises)).filter(Boolean);
    if (scrollToError && errors?.[0]) {
      const errorFirst = errors?.[0]?.[Object.keys(errors[0] || {})?.[0]];
      if (errorFirst && errorFirst?.layout?.y !== undefined) {
        scrollToError(errorFirst?.layout?.y);
      }
    }
    this.setState({errors: newErrors});
    const baseValues: {[key: string]: any} = {};
    const promise = Object.keys(values).map(async valueKey => {
      if (!valueKey.includes('.')) {
        baseValues[valueKey] = values?.[valueKey];
      } else {
        let valueParser: any = baseValues;
        valueKey.split('.').map((k, i, arrs) => {
          valueParser = valueParser[k] =
            i === arrs.length - 1 ? values?.[valueKey] : valueParser[k] || {};
        });
      }
    });
    await Promise.all(promise);
    return {values: baseValues, errors: errors.length ? errors : undefined};
  };

  private onChangeValue = ({
    name,
    value,
    error,
    validating,
  }: ParamsOnChangeValue) => {
    const {values, touched, validating: vState, errors} = this.state;
    const {onValuesChange} = this.props;
    const validateNew = isNaN(Number(validating)) ? vState?.[name] : validating;
    this.setState({
      values: {...values, [name]: value},
      errors: {...errors, [name]: error},
      validating: {...vState, [name]: !!validateNew},
      touched: {...touched, [name]: true},
    });
    onValuesChange?.({...values, [name]: value});
  };

  private blurValidate = async (field: string) => {
    const {values, fields, errors: errs} = this.state;
    const {validateMessages, validateTrigger} = this.props;
    const fieldProps = fields[field];
    const errors = await validate(
      values[field],
      {
        ...fieldProps,
        validateTrigger:
          fieldProps.validateTrigger ||
          (validateTrigger as 'onBlur' | 'onChange'),
      },
      TriggerAction.onBlur,
      validateMessages,
    );
    if (errors?.[0]) {
      this.setState({errors: {...errs, [field]: errors?.[0]}});
    }
  };

  private renderProvider = () => {
    const {form, initialValues} = this.props;
    if (form || !this.context) {
      return {...this.state, initialValues};
    }
    return this.context;
  };

  render(): JSX.Element {
    const {children, ...props} = this.props;
    return (
      <FormValues.Provider value={this.renderProvider()}>
        <FormProps.Provider value={props as any}>
          <FormControlProvider.Consumer>
            {control => {
              let pro = control;
              if (props.form || !pro) {
                pro = {
                  setField: this.setField,
                  clearField: this.clearField,
                  validateField: this.validateFieldFirst,
                  onChangeValue: this.onChangeValue,
                  setLayout: this.setLayout,
                  renameLayout: this.renameLayout,
                  blurValidate: this.blurValidate,
                };
              }
              return (
                <FormControlProvider.Provider value={pro}>
                  {children}
                </FormControlProvider.Provider>
              );
            }}
          </FormControlProvider.Consumer>
        </FormProps.Provider>
      </FormValues.Provider>
    );
  }
}

const buildForm = (): FormInstance => {
  let form: any = {};
  methods.map(method => {
    form[method] = async (...args: any[]) => {
      const keys = Object.keys(formHandle);
      if (keys.length === 1) {
        return await (formHandle[keys[0]]?.[method] as any)?.(...args);
      }
      const values: any = {};
      const promise = keys.map(async key => {
        const data = await (formHandle[key]?.[method] as any)?.(...args);
        values[formHandle[key]?.name || key] = data;
      });
      await Promise.all(promise);
      return values;
    };
  });
  form.isReady = false;
  return form;
};

Form.create = function create<T, TypeComponent>(Com: React.ComponentType<T>) {
  const form: FormInstance = buildForm();
  return React.forwardRef<TypeComponent, T>((props: T, ref) => (
    <Com {...props} ref={ref} form={form} />
  ));
};

export function useForm<T = Record<string, any>>(): FormInstance<T> {
  const form = useMemo(buildForm, []);
  useEffect(() => {
    //@ts-ignore
    Form.fastRefresh();
    return () => {
      //@ts-ignore
      Form.unMount();
    };
  }, []);
  //@ts-ignore
  return form;
}

Form.useForm = useForm;
//@ts-ignore
Form.unMount = async () => {
  const promise = Object.keys(controlRefresh).map(async key => {
    controlRefresh[key]?.unmount();
  });
  Promise.all(promise);
};
//@ts-ignore
Form.fastRefresh = async () => {
  const promise = Object.keys(controlRefresh).map(async key => {
    controlRefresh[key]?.fastRefresh();
  });
  Promise.all(promise);
};

Form.Item = Item;

class ScrollView<T> extends Component<
  FormTypes<T> & {scrollViewProps?: ScrollViewProps}
> {
  scrollView?: ScrollViewLibrary | null;

  scrollTo = (y: number) => {
    this.scrollView?.scrollTo?.({animated: true, y});
  };

  render() {
    const {children, scrollViewProps, ...props} = this.props;
    return (
      <ScrollViewLibrary
        {...scrollViewProps}
        ref={ref => (this.scrollView = ref)}>
        <Form {...props} scrollToError={this.scrollTo}>
          {children}
        </Form>
      </ScrollViewLibrary>
    );
  }
}

Form.ScrollView = ScrollView;

export default Form;
