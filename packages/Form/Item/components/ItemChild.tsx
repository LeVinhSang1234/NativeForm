import {FormItemDefault} from '@/Form/types';
import React, {cloneElement, Component, Fragment} from 'react';
import TextError from './TextError';

const keyProps = [
  'value',
  'error',
  'touched',
  'validating',
  'checked',
  'initialValue',
];

interface PropsDefault {
  value?: any;
  error?: string;
  touched?: boolean;
  validating?: boolean;
  initialValue?: any;
  onChangeValue: (v: any) => any;
  onBlur: (v: any) => any;
}

interface ItemChildProps extends PropsDefault {
  children: ((value: PropsDefault) => any) | React.ReactNode;
  initItem: (value: any, props?: any) => void;
  forceUpdate?: boolean;
  validateFirst?: boolean;
  getValueProps?: (value: any) => any;
  valuePropName?: 'number' | 'string' | 'checked';
}

class ItemChild extends Component<ItemChildProps & FormItemDefault> {
  componentDidMount() {
    const {initItem, initialValue, value} = this.props;
    initItem(value || initialValue);
  }

  UNSAFE_componentWillReceiveProps(nProps: ItemChildProps) {
    const {forceUpdate, initItem} = this.props;
    if (forceUpdate !== nProps.forceUpdate) {
      initItem(nProps.initialValue, nProps);
    }
  }

  shouldComponentUpdate(nProps: any) {
    return keyProps.some(e => (this.props as any)[e] !== nProps[e]);
  }

  renderChildren = () => {
    const {children, value, error, touched, validating, onChangeValue, onBlur} =
      this.props;
    const props = {
      value,
      error,
      touched,
      validating,
      onChangeValue,
      checked: value,
      onBlur,
    };
    if (typeof children === 'function') {
      return children(props);
    }
    return cloneElement(children as any, props);
  };

  render() {
    const {error} = this.props;
    return (
      <Fragment>
        {this.renderChildren()}
        <TextError error={error} />
      </Fragment>
    );
  }
}

export default ItemChild;
