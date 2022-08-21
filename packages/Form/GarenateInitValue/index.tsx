import {Component} from 'react';
import {LayoutRectangle} from 'react-native';
import {
  Form,
  FormItemDefault,
  ItemParams,
  TriggerAction,
  ValueForm,
} from '../types';
import {validate} from '../validateItem';

interface ValuePassing {
  name: string;
  value: any;
  error?: string;
  validating: boolean;
  propsItem: FormItemDefault;
}

interface FormState extends ValueForm {
  fields: {
    [key: string]: FormItemDefault & {total: number};
  };
  initialValues?: {[key: string]: any};
  layouts: {[key: string]: LayoutRectangle};
  forceUpdate: boolean;
}

class GarenateInitValue extends Component<
  Form & {scrollToError?: (y: number) => void},
  FormState
> {
  promises: Promise<any | void>[];
  timeout?: NodeJS.Timeout;
  timeoutClear?: NodeJS.Timeout;
  timeoutLayout?: NodeJS.Timeout;
  promiseClears: Promise<any | void>[];
  promiseLayouts: Promise<any | void>[];

  constructor(props: Form) {
    super(props);
    const {initialValues = {}} = props;
    this.promises = [];
    this.promiseClears = [];
    this.promiseLayouts = [];
    this.state = {
      values: initialValues,
      errors: {},
      touched: {},
      validating: {},
      fields: {},
      initialValues,
      layouts: {},
      forceUpdate: false,
    };
  }

  setLayout = ({name, layout}: {name: string; layout: LayoutRectangle}) => {
    if (this.timeoutLayout) {
      clearTimeout(this.timeoutLayout);
    }
    this.promiseLayouts.push(Promise.resolve({name, layout}));
    this.timeoutLayout = setTimeout(async () => {
      const layouts = await Promise.all(this.promiseLayouts);
      const {layouts: layoutsState, fields} = this.state;
      const newLayout: {[key: string]: LayoutRectangle} = {...layoutsState};
      for (const lay of layouts) {
        if (fields?.[lay.name]?.total < 2 || !newLayout[lay.name]) {
          newLayout[lay.name] = lay.layout;
        }
      }
      this.setState({layouts: newLayout});
    }, 100);
  };

  renameLayout = (name: string, name2: string) => {
    if (this.timeoutLayout) {
      clearTimeout(this.timeoutLayout);
    }
    this.promiseLayouts.push(Promise.resolve({old: name, new: name2}));
    this.timeoutLayout = setTimeout(async () => {
      const layouts = await Promise.all(this.promiseLayouts);
      const {layouts: layoutsState} = this.state;
      const newLayoutClone: {[key: string]: LayoutRectangle} = {
        ...layoutsState,
      };
      for (const lay of layouts) {
        newLayoutClone[lay.new] = newLayoutClone[lay.old];
        delete newLayoutClone[lay.old];
      }
      this.setState({layouts: newLayoutClone});
    }, 100);
  };

  setField = ({value, propsItem: p}: ItemParams) => {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.promises.push(
      Promise.resolve({name: p.name, value, propsItem: p} as ValuePassing),
    );
    this.promiseInitValueFirst();
  };

  validateFieldFirst = async ({value, propsItem: p}: ItemParams) => {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    const {validateMessages} = this.props;
    this.promises.push(
      validate(value, p, TriggerAction.all, validateMessages).then(errs => {
        return {
          name: p.name,
          value,
          error: errs?.[0],
          validating: true,
          propsItem: p,
        };
      }) as Promise<ValuePassing>,
    );
    this.promiseInitValueFirst();
  };

  promiseInitValueFirst = async () => {
    const {errors, fields, validating} = this.state;
    this.timeout = setTimeout(async () => {
      this.timeout = undefined;
      const validates: ValuePassing[] = await Promise.all(this.promises);
      if (this.timeout) {
        return;
      }
      this.promises = [];
      const newValues: {[key: string]: any} = {};
      const newErrors = {...errors};
      const newValidating = {...validating};
      let fds = {...fields};
      const promise = validates.map(async val => {
        if (!fds[val.propsItem.name]) {
          fds[val.propsItem.name] = {...val.propsItem, total: 1};
          newValues[val.name] = val.value;
          newErrors[val.name] = val.error;
          newValidating[val.name] = val.validating;
        } else {
          const element = fds?.[val.propsItem.name];
          fds[val.propsItem.name] = {
            ...fds?.[val.propsItem.name],
            required: !!element?.required || !!val.propsItem.required,
            rules: [...(element?.rules || []), ...(val.propsItem?.rules || [])],
          };
          fds[val.propsItem.name].total += 1;
          if (!newValues[val.name]) {
            newValues[val.name] = val.value;
          }
          if (!newErrors[val.name]) {
            newErrors[val.name] = val.error;
          }
          if (!newValidating[val.name]) {
            newValidating[val.name] = val.validating;
          }
        }
      });
      await Promise.all(promise);
      this.setState({
        ...this.state,
        values: newValues,
        errors: newErrors,
        validating: newValidating,
        fields: fds,
        initialValues: newValues,
      });
    }, 100);
  };

  promiseClearAsync = async (name: string, nameNew?: string): Promise<void> => {
    const {fields, values, errors, touched, validating} = this.state;
    let fds = {...fields};
    if (nameNew) {
      values[nameNew] = values[name];
      errors[nameNew] = errors[name];
      touched[nameNew] = touched[name];
      validating[nameNew] = validating[name];
      fds[nameNew] = {...fds[name], name: nameNew};
    }
    delete values[name];
    delete errors[name];
    delete touched[name];
    delete validating[name];
    if (fields[name]?.total > 1) {
      fields[name].total -= 1;
    } else {
      delete fds[name];
    }
    this.setState({fields: fds, values, errors, touched, validating});
  };

  clearField = (name: string, nameNew?: string) => {
    const {preserve} = this.props;
    if (preserve && !nameNew) {
      return;
    }
    if (this.timeoutClear) {
      clearTimeout(this.timeoutClear);
    }
    this.promiseClears.push(this.promiseClearAsync(name, nameNew));
    this.timeoutClear = setTimeout(() => {
      this.timeoutClear = undefined;
      Promise.all(this.promiseClears);
    }, 100);
  };
}

export default GarenateInitValue;
