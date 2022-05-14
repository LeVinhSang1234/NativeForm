import React, {Component, ReactChild, useRef} from 'react';
import {View, NativeEventEmitter} from 'react-native';
import Item from './Item';
import {
  IError,
  IErrorForm,
  IForm,
  IFormHandle,
  IFormHandleRemap,
  IFormProps,
  IItemProps,
  IValueForm,
} from './types';

const characters =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function random(length: number = 16) {
  let result = '';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const uuid: string = random(26);

const formControl: IForm = {
  [uuid]: {
    ref: {},
    value: {},
    touched: {},
    validateFirst: false,
  },
};

const handle: any = {};
const handleForm: IFormHandleRemap = {
  setFieldsValue: () => null,
  setFieldValue: () => null,
  getFieldValue: () => undefined,
  getFieldsValue: () => {},
  validateFields: async () => undefined,
  resetFields: () => undefined,
  setFieldError: () => undefined,
  getTouched: () => undefined,
};

let errors: IError = {};

class Form extends Component<IFormProps> {
  static useForm: () => IFormHandle;
  static Item: (props: IItemProps) => JSX.Element;
  static create: () => (
    WrapComponent: React.ComponentType<any>,
  ) => React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;

  constructor(props: IFormProps) {
    super(props);
    this.initApp();
  }

  initApp = async () => {
    const {
      initialValues = {},
      validateFirst,
      colon,
      formItemLayout,
      dotRequired = 'after',
      form,
    } = this.props;
    handle.onChange = this.onChange;
    handle.onBlurInput = this.onBlurInput;
    handle.onParseField = this.onParseField;
    handle.onPress = this.onPress;
    handle.colon = colon;
    handle.formItemLayout = formItemLayout;
    handle.dotRequired = dotRequired;
    handleForm.setFieldsValue = this.setFieldsValue;
    handleForm.setFieldValue = this.setFieldValue;
    handleForm.getFieldValue = this.getFieldValue;
    handleForm.getFieldsValue = this.getFieldsValue;
    handleForm.validateFields = this.validateFields;
    handleForm.setFieldError = this.setFieldError;
    handleForm.resetFields = this.resetFields;
    handleForm.getTouched = this.getTouched;
    if (form?.uid) {
      formControl[form?.uid] = {
        ref: {},
        value: {},
        touched: {},
      };
    }
    let uid = form?.uid || uuid;
    formControl[uid].validateFirst = validateFirst;
    const data = Object.keys(initialValues).map(async key => {
      formControl[uid].value[key] = initialValues[key];
    });
    await Promise.all(data);
  };

  UNSAFE_componentWillReceiveProps(nProps: IFormProps) {
    const {colon, dotRequired = 'after', formItemLayout} = this.props;
    if (dotRequired !== nProps.dotRequired) {
      handle.dotRequired = nProps.dotRequired;
    }
    if (colon !== nProps.colon) {
      handle.colon = nProps.colon;
    }
    if (formItemLayout !== nProps.formItemLayout) {
      handle.formItemLayout = nProps.formItemLayout;
    }
  }

  componentWillUnmount() {
    const {form} = this.props;
    if (form?.uid) {
      delete formControl[form.uid];
    }
  }

  onChange = (v: any, name: string, error?: string, uid: string = uuid) => {
    if (!formControl[uid]) {
      uid = uuid;
    }
    formControl[uid].value[name] = v;
    if (typeof formControl[uid].ref[name] === 'function') {
      formControl[uid].ref[name](v, error);
    }
  };

  onBlurInput = (name: string, v: any, uid: string = uuid) => {
    if (!formControl[uid]) {
      uid = uuid;
    }
    formControl[uid].ref[name]?.(v, undefined, true);
  };

  onParseField = (name: string, value?: any, uid: string = uuid) => {
    if (!formControl[uid]) {
      uid = uuid;
    }
    const {initialValues} = this.props;
    if (value !== undefined || initialValues?.[name] !== undefined) {
      formControl[uid].value[name] = value || initialValues?.[name];
    } else {
      formControl[uid].value[name] = initialValues?.[name];
    }
  };

  onPress = (e: NativeEventEmitter, func: any, uid: string = uuid) => {
    if (!formControl[uid]) {
      uid = uuid;
    }
    if (typeof func === 'function') {
      func(e, {
        value: formControl[uid].value,
        erorrs: Object.keys(errors).map(key => ({[key]: errors[key]})),
      });
    }
  };

  setFieldsValue = async (
    values: any,
    errorsValue: any = {},
    uid: string = uuid,
  ) => {
    if (!formControl[uid]) {
      uid = uuid;
    }
    const promise = Object.keys(values).map(async key => {
      if (typeof formControl[uid].ref[key] === 'function') {
        formControl[uid].value[key] = values[key];
        return this.onChange(values[key], key, errorsValue[key]);
      }
    });
    await Promise.all(promise);
  };

  setFieldValue(key: string, value: any, error: any, uid: string = uuid) {
    if (!uid || !formControl[uid]) {
      uid = uuid;
    }
    formControl[uid].value[key] = value;
    if (typeof formControl[uid].ref[key] === 'function') {
      formControl[uid].ref[key](value, error);
    }
  }

  getFieldValue = (key: string, uid: string = uuid) => {
    if (!formControl[uid]) {
      uid = uuid;
    }
    return formControl[uid].value[key];
  };

  getFieldsValue = (uid: string = uuid) => {
    if (!formControl[uid]) {
      uid = uuid;
    }
    return formControl[uid].value;
  };

  validateFields = async (
    calback?: (err?: IErrorForm[], v?: IValueForm) => any,
    custom?: {fields?: string[]; excepts?: string[]},
    uid: string = uuid,
  ) => {
    if (!formControl[uid]) {
      uid = uuid;
    }
    const {fields = Object.keys(formControl[uid].value), excepts} =
      custom || {};

    const promise = fields.map(async key => {
      if (typeof formControl[uid].ref[key] === 'function') {
        return formControl[uid].ref[key](
          formControl[uid].value[key],
          undefined,
          true,
        );
      }
    });
    await Promise.all(promise);
    let arrayKeys = Object.keys(errors);
    if (excepts && excepts.length) {
      arrayKeys = arrayKeys.filter((key: string) => !excepts.includes(key));
    }
    let errorArr: {[key: string]: any}[] | undefined = arrayKeys.map(
      (key: string) => ({
        [key]: errors[key],
      }),
    );
    if (!errorArr.length) {
      errorArr = undefined;
    }
    if (typeof calback === 'function') {
      calback(errorArr, formControl[uid].value);
    }
    return {errors: errorArr, values: formControl[uid].value};
  };

  setFieldError = (field: string, error?: string, uid: string = uuid) => {
    if (!uid || !formControl[uid]) {
      uid = uuid;
    }
    if (typeof formControl[uid].ref[field] === 'function') {
      formControl[uid].ref[field](formControl[uid].value[field], error);
    }
  };

  resetFields = async (
    fields: any[],
    errorsValue: any = {},
    uid: string = uuid,
  ) => {
    if (!uid || !formControl[uid]) {
      uid = uuid;
    }
    const promise = (fields || Object.keys(formControl[uid].value)).map(
      async key => {
        return this.onChange(undefined, key, errorsValue[key]);
      },
    );
    await Promise.all(promise);
  };

  getTouched = (field?: string, uid: string = uuid) => {
    if (!uid || !formControl[uid]) {
      uid = uuid;
    }
    if (!field) {
      return formControl[uid].touched;
    }
    return formControl[uid].touched?.[field];
  };

  renderChild = (child: any) => {
    const {form} = this.props;
    return {...child, props: {...child.props, form}};
  };

  render() {
    const {style, children} = this.props;
    if (!children) {
      return null;
    }
    return (
      <View style={style}>
        {Array.isArray(children)
          ? children.map((child: any) => this.renderChild(child))
          : this.renderChild(children)}
      </View>
    );
  }
}

function createUid(): string {
  const uid = random(26);
  if (formControl[uid]) {
    return createUid();
  }
  return uid;
}

Form.useForm = (): IFormHandle & {uid: string} => {
  const uid = useRef(createUid()).current;
  return {
    setFieldsValue: (value: any, errs?: any) => {
      return handleForm.setFieldsValue(value, errs, uid);
    },
    setFieldValue: (
      key: string,
      value?: any,
      error?: ReactChild | undefined,
    ) => {
      return handleForm.setFieldValue(key, value, error, uid);
    },
    getFieldValue: (field: string) => {
      return handleForm.getFieldValue(field, uid);
    },
    getFieldsValue: () => {
      return handleForm.getFieldsValue(uid);
    },
    validateFields: (
      calback?: (err?: IErrorForm, values?: IValueForm) => any,
      data?: {fields?: string[]; excepts?: string[]},
    ) => {
      return handleForm.validateFields(calback, data, uid);
    },
    setFieldError: (field: string, error?: any) => {
      return handleForm.setFieldError(field, error, uid);
    },
    resetFields: (fields?: any, errs?: any) => {
      return handleForm.resetFields(fields, errs, uid);
    },
    getTouched: (field?: string) => {
      return handleForm.getTouched(field, uid);
    },
    uid,
  };
};

Form.Item = (props: IItemProps) => {
  const newProps: any = props;
  const {form} = newProps;
  const uid = form?.uid || uuid;
  const formControlItem: any = formControl[uid];
  return (
    <Item
      {...props}
      errors={errors}
      form={formControlItem}
      onChange={(v: any, name: string, error?: string) => {
        return handle.onChange(v, name, error, uid);
      }}
      onChangeText={(v: any, name: string) => {
        return handle.onChange(v, name, undefined, uid);
      }}
      onValueChange={(v: any, name: string) => {
        return handle.onChange(v, name, undefined, uid);
      }}
      onChangeInput={props.onChange}
      onParseField={(v: any, callback: any) => {
        return handle.onParseField(v, callback, uid);
      }}
      onPress={handle.onPress}
      value={formControlItem?.[props.name] || props.defaultValue}
      colon={handle.colon}
      dotRequired={handle.dotRequired}
      formItemLayout={handle.formItemLayout}
      onBlurInput={handle.onBlurInput}
    />
  );
};

Form.create = () => {
  return (WrapComponent: React.ComponentType<any>) =>
    React.forwardRef((p, ref) => {
      return <WrapComponent {...p} form={handleForm} ref={ref} />;
    });
};

export default Form;
