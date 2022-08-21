import {createContext, useContext} from 'react';
import {
  defaultValidateMessages,
  Form,
  FormControl,
  TriggerAction,
  ValueForm,
} from './Form/types';

//-----------------//

let defaultValues:
  | (ValueForm & {forceUpdate: boolean; initialValues?: {[key: string]: any}})
  | undefined;
export const FormValues = createContext(defaultValues as any);

//-----------------//

const defaultValueProvider: Form = {
  colon: true,
  labelAlign: 'left',
  requiredMark: true,
  validateMessages: defaultValidateMessages,
  validateTrigger: TriggerAction.onChange,
};

export const FormProps = createContext(defaultValueProvider);

export const useFormProps = () => {
  return useContext(FormProps);
};

//-----------------//

let defaultFormControl: FormControl | undefined;

export const FormControlProvider = createContext(defaultFormControl);
