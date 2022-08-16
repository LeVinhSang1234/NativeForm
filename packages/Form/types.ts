import React from 'react';
import {LayoutRectangle, TextStyle, ViewStyle} from 'react-native';

export declare type Form = {
  colon?: boolean; //Configure the default value of colon for Form.Item. Indicates whether the colon after the label is displayed (only effective when prop layout is horizontal)
  form?: FormInstanceControl | FormInstance;
  initialValues?: {[key: string]: any}; //default values
  labelAlign?: 'left' | 'right'; //The text align of label of all items
  name?: string; //Form name. Will be the prefix of Field id
  preserve?: boolean; //Keep field value even when field removed
  requiredMark?: boolean | string; //Required mark style. Can use required mark or optional mark. You can not config to single Form.Item since this is a Form level config
  requiredMarkStyle?: TextStyle;
  requiredMarkPosition?: 'before' | 'after';
  validateMessages?: ValidateMessages; //Validation prompt template
  validateTrigger?: TriggerAction | 'onChange' | 'onBlur'; //Config field validate trigger
  onValuesChange?: (values: {[key: string]: any}) => void; //Trigger when value updated
  errorStyle?: TextStyle;
};

export declare type FormItemDefault = {
  name: string;
  label?: string; //Label text
  rules?: Rule[];
  required?: boolean; //Display required style. It will be generated by the validation rule
  validateTrigger?: 'onChange' | 'onBlur'; //When to validate the value of children node
};

export declare type FormItem = {
  colon?: boolean; //Used with label, whether to display : after label text.
  getValueProps?: (value: any) => any; //Additional props with sub component
  hidden?: boolean; //Whether to hide Form.Item (still collect and validate value)
  initialValue?: any; //Config sub default value. Form initialValues get higher priority when conflict
  labelAlign?: 'left' | 'right'; //The text align of label
  validateFirst?: boolean; //Whether stop validate on first rule of error for this field. Will parallel validate when parallel cofigured
  valuePropName?: 'number' | 'string' | 'checked'; //Props of children node, for example, the prop of Switch is 'checked'. This prop is an encapsulation of getValueProps, which will be invalid after customizing getValueProps
  children:
    | ((handle: {
        onChangeValue: (value: any) => any;
        onBlur: () => any;
        value?: any;
        error?: string;
      }) => JSX.Element)
    | React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  errorStyle?: TextStyle;
  labelStyle?: TextStyle;
  preserve?: boolean; //Keep field value even when field removed
} & FormItemDefault;

export declare type FilterGetValues = (meta: {
  touched: boolean;
  validating: boolean;
}) => true;

export declare type ValueValidateField = {
  values: {
    [key: string]: any;
  };
  errors?: {
    [key: string]: {
      errors: string[];
      layout: LayoutRectangle;
    };
  }[];
};

export declare type ValueError = {[key: string]: string | undefined};

export declare type FormInstanceControl = {
  getFieldError: (name: string) => Promise<string | undefined>;
  getFieldsError: (
    names?: string[],
  ) => Promise<{[key: string]: string | undefined}>; //Get the error messages by the fields name. Return as an array
  getFieldsValue: (names?: string[], filter?: FilterGetValues) => Promise<any>; //Get values by a set of field names. Return according to the corresponding structure. Default return mounted field value, but you can use getFieldsValue() to get all values
  getFieldValue: (name: string) => Promise<any>; //Get the value by the field name
  isFieldsTouched: (names?: string[], allTouched?: boolean) => Promise<boolean>; //Check if fields have been operated. Check if all fields is touched when allTouched is true
  isFieldTouched: (name: string) => Promise<boolean>; //Check if a field has been operated
  isFieldValidating: (name: string) => Promise<boolean>; //Check field if is in validating
  resetFields: (fields?: string[]) => Promise<void>; //Reset fields to initialValues
  setFields: (fields: FieldData[]) => Promise<void>; //Set fields status
  setFieldValue: (name: string, value: any) => Promise<any>; //Set fields value(Will directly pass to form store. If you do not want to modify passed object, please clone first)
  setFieldsValue: (values: {[key: string]: any}) => Promise<any>; //Set fields value(Will directly pass to form store. If you do not want to modify passed object, please clone first).
  validateFields: (names?: string[]) => Promise<ValueValidateField>; //Validate fields
};

export declare type FormInstance = {
  getFieldError: (
    name: string,
  ) => Promise<(string | undefined)[] | string | undefined>;
  getFieldsError: (names?: string[]) => Promise<ValueError[] | ValueError>; //Get the error messages by the fields name. Return as an array
  getFieldsValue: (
    names?: string[],
    filter?: FilterGetValues,
  ) => Promise<any[] | any>; //Get values by a set of field names. Return according to the corresponding structure. Default return mounted field value, but you can use getFieldsValue(true) to get all values
  getFieldValue: (name: string) => any; //Get the value by the field name
  isFieldsTouched: (
    names?: string[],
    allTouched?: boolean,
  ) => Promise<boolean[] | boolean>; //Check if fields have been operated. Check if all fields is touched when allTouched is true
  isFieldTouched: (name: string) => Promise<boolean[] | boolean>; //Check if a field has been operated
  isFieldValidating: (name: string) => Promise<boolean[] | boolean>; //Check field if is in validating
  resetFields: (fields?: string[]) => Promise<void>; //Reset fields to initialValues
  setFields: (fields: FieldData[]) => Promise<void>; //Set fields status
  setFieldValue: (name: string, value: any) => Promise<void>; //Set fields value(Will directly pass to form store. If you do not want to modify passed object, please clone first)
  setFieldsValue: (values: {[key: string]: any}) => Promise<void>; //Set fields value(Will directly pass to form store. If you do not want to modify passed object, please clone first).
  validateFields: (
    names?: string[],
  ) => Promise<Array<ValueValidateField> | ValueValidateField>; //Validate fields
};

export declare type FieldData = {
  error?: string; //Error messages
  name: string; //Field name path;
  touched?: boolean; //Whether is operated
  validating?: boolean; //Whether is in validating
  value: any; //Field value
};

export declare type ValidateMessages = {
  required?: string;
  whitespace?: string;
  len?: string;
  min?: string;
  max?: string;
  pattern?: string;
  enum?: string;
};

export declare type Rule = {
  required?: boolean; //Display required style. It will be generated by the validation rule
  enum?: any[]; //Match enum value. You need to set type to enum to enable this
  len?: number; //Length of string
  max?: number; // max of number
  min?: number; // min of number
  message?: string; //Error message. Will auto generate by template if not provided
  pattern?: RegExp; //Regex pattern
  transform?: (value: any) => any; //Transform value to the rule before validation
  validateTrigger?: TriggerAction | 'onChange' | 'onBlur';
  validator?: (
    rule: Rule,
    value: any,
    callback: (errorMessage?: string) => void,
  ) => Promise<void | Error>; //Customize validation rule. Accept Promise as return. See example
  whitespace?: boolean; //Failed if only has whitespace
};

export const defaultValidateMessages = {
  required: '${name} is required',
  whitespace: '${name} cannot be empty',
  len: '${name} must be exactly ${len} characters',
  min: '${name} must be less than ${min}',
  max: '${name} cannot be greater than ${max}',
  pattern: '${name} does not match pattern ${pattern}',
  enum: '${name} must be one of ${enum}',
};

export declare type Create = <T>(
  Component: React.ComponentType<T>,
) => React.ForwardRefExoticComponent<
  React.PropsWithoutRef<T> & React.RefAttributes<unknown>
>;

export declare type ValueForm = {
  values: {[key: string]: any | undefined};
  errors: {[key: string]: string | undefined};
  touched: {[key: string]: boolean};
  validating: {[key: string]: boolean};
};

export declare type ItemParams = {
  value: any | undefined;
  propsItem: FormItemDefault;
};

export declare type ParamsOnChangeValue = {
  name: string;
  value: any;
  error?: string;
  validating?: boolean;
};

export declare type FormControl = {
  setField: (v: ItemParams) => any;
  clearField: (name: string, nameNew?: string) => any;
  validateField: (v: ItemParams) => any;
  onChangeValue: (params: ParamsOnChangeValue) => any;
  setLayout: (config: {name: string; layout: LayoutRectangle}) => any;
  renameLayout: (name: string, name2: string) => any;
  blurValidate: (name: string) => any;
};

export enum TriggerAction {
  onChange = 'onChange',
  onBlur = 'onBlur',
  all = 'all',
}
