import {createContext, useContext} from 'react';
import {ValueProviderState} from './Form/types';

const defaultValueProvider: ValueProviderState = {
  hiddenRequired: false,
};

const FormContext = createContext(defaultValueProvider);

export const useFormProvider = () => {
  return useContext(FormContext);
};

export default FormContext;
