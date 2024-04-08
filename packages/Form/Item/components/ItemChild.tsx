import {FormItemDefault} from '../../../Form/types';
import React, {
  cloneElement,
  Component,
  FC,
  Fragment,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import TextError from './TextError';
import {TextStyle} from 'react-native';

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
  addNewInitItem: (value: any, props?: any) => void;
  forceUpdate?: boolean;
  validateFirst?: boolean;
  getValueProps?: (value: any) => any;
  valuePropName?: 'number' | 'string' | 'checked';
  keepValueWhenChangeName?: boolean;
  allowAddItemWhenChangeName?: boolean;
  errorStyle?: TextStyle[] | TextStyle;
}

class ItemChild extends Component<ItemChildProps & FormItemDefault> {
  componentDidMount() {
    const {initItem, initialValue, value} = this.props;
    initItem(value || initialValue);
  }

  UNSAFE_componentWillReceiveProps(nProps: ItemChildProps & FormItemDefault) {
    const {
      forceUpdate,
      initItem,
      addNewInitItem,
      name,
      keepValueWhenChangeName,
      allowAddItemWhenChangeName,
      value,
    } = this.props;
    const {name: n} = nProps;
    if (forceUpdate !== nProps.forceUpdate) {
      initItem(nProps.initialValue, nProps);
    } else if (name !== n && allowAddItemWhenChangeName) {
      if (keepValueWhenChangeName) {
        addNewInitItem(value, nProps);
      } else {
        addNewInitItem(nProps.value || nProps.initialValue, nProps);
      }
    }
  }

  private renderChildren = () => {
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
      if (typeof children(props).then === 'function') {
        return <PromiseComponent>{children(props)}</PromiseComponent>;
      }
      return children(props);
    }
    return cloneElement(children as any, props);
  };

  render() {
    const {error, errorStyle} = this.props;
    return (
      <Fragment>
        {this.renderChildren()}
        <TextError errorStyle={errorStyle} error={error} />
      </Fragment>
    );
  }
}

const PromiseComponent: FC<{children: Promise<ReactNode>}> = ({children}) => {
  const [data, setData] = useState<ReactNode>(null);

  useEffect(() => {
    children.then((result: ReactNode) => setData(result));
  }, [children]);

  return <>{data}</>;
};

export default ItemChild;
