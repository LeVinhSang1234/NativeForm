import {ReactChild} from 'react';
import {TextStyle, ViewStyle} from 'react-native';

export declare type IItemProps = {
  styles?: {
    error: TextStyle;
    label: TextStyle;
    colon: TextStyle;
  };
  children?: any;
  defaultValue?: any;
  checked?: boolean;
  name: string;
  onBlurInput?: any;
  onBlur?: any;
  onParseField?: (v: any, callback: any) => any;
  onChange?: (v: any, name: string) => any;
  value?: any;
  onPress?: (v: any, key: any) => any;
  rule?: {
    whitespace?: boolean;
    required?: boolean;
    message?: any;
    validator?: (
      value: any,
      callback: (messageErro?: any) => any,
      touched?: boolean,
    ) => any;
    trigger?: 'onChange' | 'blur';
  };
  validateFirst?: boolean;
  onValueChange?: (v: any, key: string) => any;
  onChangeText?: (v: any, name: string) => any;
  onChangeInput?: (v: any, key: any) => any;
  label?: any;
  colon?: string;
  dotRequired?: 'before' | 'after';
  formItemLayout?: {
    labelCol: {
      xs: number;
      sm: number;
    };
    wrapperCol: {
      xs: number;
      sm: number;
    };
  };
};

export interface IErrorForm {
  [key: string]: any;
}

export interface IValueForm {
  [key: string]: any;
}

export declare type IFormHandle = {
  setFieldsValue: (
    values: {[key: string]: any},
    errors?: {[key: string]: any},
  ) => void;
  setFieldValue: (
    key: string,
    value?: any,
    error?: ReactChild | undefined,
  ) => void;
  getFieldValue: (field: string) => any;
  getFieldsValue: () => any;
  validateFields: (
    calback?: (err?: IErrorForm, values?: IValueForm) => any,
    data?: {fields?: string[]; excepts?: string[]},
  ) => Promise<{errors: {[key: string]: any}; values: {[key: string]: any}}>;
  resetFields: (fields?: string[], errors?: {[key: string]: any}) => void;
  setFieldError: (field: string, error?: any) => void;
  getTouched: (field?: string) => boolean;
};

export interface IFormHandleRemap {
  setFieldsValue: (
    values: {[key: string]: any},
    errors?: {[key: string]: any},
    uid?: string,
  ) => void;
  setFieldValue: (
    key: string,
    value?: any,
    error?: ReactChild | undefined,
    uid?: string,
  ) => void;
  getFieldValue: (field: string, uid?: string) => any;
  getFieldsValue: (uid?: string) => any;
  validateFields: (
    calback?: (err?: IErrorForm, values?: IValueForm) => any,
    data?: {fields?: string[]; excepts?: string[]},
    uid?: string,
  ) => Promise<any>;
  resetFields: (fields?: any, errors?: any, uid?: string) => void;
  setFieldError: (field: string, error?: any, uid?: string) => void;
  getTouched: (field?: string, uid?: string) => any;
}

export interface IError {
  [key: string]: any;
}

export interface IFormProps {
  initialValues?: {
    [key: string]: any;
  };
  children: any;
  validateFirst?: boolean;
  style?: ViewStyle;
  colon?: boolean;
  formItemLayout?: {
    labelCol: {
      xs: number;
      sm: number;
    };
    wrapperCol: {
      xs: number;
      sm: number;
    };
  };
  dotRequired?: 'before' | 'after';
  form?: IFormHandle & {uid: string};
  hiddenRequired?: boolean;
}

export interface IForm {
  [key: string]: {
    ref: {[key: string]: any};
    value: {[key: string]: any};
    touched: {[key: string]: any};
    layout: {
      [key: string]: {
        x: number;
        y: number;
        height: number;
        width: number;
      };
    };
    validateFirst?: boolean;
  };
}
