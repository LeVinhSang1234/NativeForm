import React, {Component} from 'react';
import {createID, FreezeChild} from '@/utils';
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

let formHandle: {[key: string]: FormInstance} = {};
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

class Form extends GarenateInitValue {
  static contextType = FormValues;
  static Item: typeof Item;
  static ScrollView: typeof ScrollView;
  static create: Create;
  static useForm: () => FormInstance;
  static fastRefresh: () => void;
  static unMount: () => void;
  id: string;
  unmount: boolean;

  constructor(props: FormTypes) {
    super(props);
    this.unmount = false;
    this.promises = [];
    this.promiseClears = [];
    this.promiseLayouts = [];
    this.id = props.name || createID(60);
    this.garenateInitForm();
    controlRefresh[this.id] = {
      unmount: async () => (this.unmount = true),
      fastRefresh: this.fastRefresh,
    };
  }

  garenateInitForm() {
    const {form} = this.props;
    if (form) {
      for (const method of methods) {
        form[method] = this[method] as any;
      }
    } else if (!this.context) {
      if (formHandle[this.id]) {
        throw new Error('Form props duplicate name');
      }
      formHandle[this.id] = {} as any;
      for (const method of methods) {
        (formHandle[this.id] as any)[method] = this[method];
      }
    }
  }

  componentWillUnmount() {
    delete formHandle[this.id];
    delete controlRefresh[this.id];
  }

  fastRefresh = async () => {
    const {initialValues = {}, form} = this.props;
    const {forceUpdate} = this.state;
    if (form) {
      const promise = methods.map(async method => {
        form[method] = this[method] as any;
      });
      Promise.all(promise);
    }
    if (this.unmount) {
      if (Object.keys(initialValues).length) {
        this.setFieldsValue(initialValues, true);
        this.unmount = false;
      } else {
        this.setState({forceUpdate: !forceUpdate});
      }
    }
  };

  getFieldError = async (name: string) => {
    const {errors, fields} = this.state;
    if (!fields[name]) {
      console.warn(`Field ${name} not existed in Form`);
    }
    return errors?.[name];
  };

  getFieldsError = async (names?: string[]) => {
    const {errors, fields: fds} = this.state;
    let errs: {[key: string]: string | undefined} = {};
    const fields = names || Object.keys(fds || {});
    if (!Array.isArray(fields)) {
      return Promise.reject(
        'method getFieldsError allow params the names must be an array and of type string[]',
      );
    }
    const promise = fields.map(async field => {
      if (!fds[field]) {
        console.warn(`Field ${field} not existed in Form`);
      }
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

  getFieldsValue = async (names?: string[], filter?: FilterGetValues) => {
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

  getFieldValue = async (name: string) => {
    const {values, fields} = this.state;
    if (!fields[name]) {
      console.warn(`Field ${name} not existed in Form`);
    }
    return values?.[name];
  };

  isFieldsTouched = async (names?: string[], allTouched?: boolean) => {
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

  isFieldTouched = async (name: string) => {
    const {touched, fields} = this.state;
    if (!fields[name]) {
      console.warn(`Field ${name} not existed in Form`);
    }
    return !!touched?.[name];
  };

  isFieldValidating = async (name: string) => {
    const {validating, fields} = this.state;
    if (!fields[name]) {
      console.warn(`Field ${name} not existed in Form`);
    }
    return !!validating?.[name];
  };

  resetFields = async (names?: string[]) => {
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
      if (fds[field]) {
        newValues[field] = initialValues?.[field];
        delete touched[field];
        delete errors[field];
        delete validating[field];
      } else {
        console.warn(`Field ${field} not existed in Form`);
      }
    });
    await Promise.all(promise);
    this.setState({values: newValues, errors, touched, validating});
  };

  setFields = async (fields: FieldData[]) => {
    if (!Array.isArray(fields)) {
      return Promise.reject(
        'method setFields allow params the fields must be an array and of type string[]',
      );
    }
    const {
      values,
      errors,
      touched: t,
      validating: v,
      fields: fState,
    } = this.state;
    const newValues: {[key: string]: any} = {};
    const errs: {[key: string]: string | undefined} = {};
    const validating: {[key: string]: boolean} = {};
    const touched: {[key: string]: boolean} = {};
    const promise = fields.map(async field => {
      if (fState[field.name]) {
        newValues[field.name] = field.value;
        errors[field.name] = field.error;
        validating[field.name] =
          field.validating === undefined ? v?.[field.name] : field.validating;
        touched[field.name] =
          field.touched === undefined ? t?.[field.name] : field.touched;
      } else {
        console.warn(`Field ${field.name} not existed in Form`);
      }
    });
    await Promise.all(promise);
    this.setState({
      values: {...values, ...newValues},
      errors: {...errors, ...errs},
      touched: {...t, ...touched},
      validating: {...v, ...validating},
    });
  };

  setFieldValue = async (name: string, value: string) => {
    const {fields, values, errors: errs} = this.state;
    const {validateMessages} = this.props;
    if (fields[name]) {
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
    } else {
      console.warn(`Field ${name} not existed in Form`);
    }
  };

  setFieldsValue = async (
    values: {[key: string]: any},
    forceUpdate?: boolean,
  ) => {
    const {fields, values: vS, errors: errs, forceUpdate: force} = this.state;
    const {validateMessages} = this.props;
    let errors: {[key: string]: string | undefined} = {};
    const promises = Object.keys(values).map(async key => {
      if (fields[key]) {
        return validate(
          values[key],
          fields[key],
          TriggerAction.all,
          validateMessages,
        ).then(errrs => {
          errors[key] = errrs?.[0];
        });
      } else {
        console.warn(`Field ${key} not existed in Form`);
      }
    });
    await Promise.all(promises);
    this.setState({
      values: {...vS, ...values},
      errors: {...errs, ...errors},
      forceUpdate: forceUpdate ? !force : force,
    });
  };

  validateFields = async (names?: string[]): Promise<ValueValidateField> => {
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
      if (fds[field]) {
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

  onChangeValue = ({name, value, error, validating}: ParamsOnChangeValue) => {
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

  blurValidate = async (field: string) => {
    const {values, fields, errors: errs} = this.state;
    const {validateMessages} = this.props;
    const errors = await validate(
      values[field],
      fields[field],
      TriggerAction.onBlur,
      validateMessages,
    );
    if (errors?.[0]) {
      this.setState({errors: {...errs, [field]: errors?.[0]}});
    }
  };

  renderProvider = () => {
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
        <FormProps.Provider value={props}>
          <FreezeChild reload={children}>
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
          </FreezeChild>
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
        values[key] = data;
      });
      await Promise.all(promise);
      return values;
    };
  });
  return form;
};

Form.create = function create<T>(Com: React.ComponentType<T>) {
  const form: FormInstance = buildForm();
  return React.forwardRef((props: T, ref) => (
    <Com {...props} ref={ref} form={form} />
  ));
};

const useForm = (): FormInstance => {
  return buildForm();
};

Form.useForm = useForm;

Form.unMount = async () => {
  const promise = Object.keys(controlRefresh).map(async key => {
    controlRefresh[key]?.unmount();
  });
  Promise.all(promise);
};

Form.fastRefresh = async () => {
  const promise = Object.keys(controlRefresh).map(async key => {
    controlRefresh[key]?.fastRefresh();
  });
  Promise.all(promise);
};

Form.Item = Item;

class ScrollView extends Component<
  FormTypes & {scrollViewProps?: ScrollViewProps}
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
