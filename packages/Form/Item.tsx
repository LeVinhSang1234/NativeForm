import React, {Component} from 'react';
import {
  NativeEventEmitter,
  StyleSheet,
  View,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import Text from '../Text';
import {IError, IItemProps} from './types';

const TextAnimated = Animated.createAnimatedComponent(Text);

interface IStateItem {
  valueState: {value: any; error: any};
  initialValues: {value: any; error: any};
}

class Item extends Component<
  IItemProps & {
    form: any;
    errors: IError;
    hiddenRequired?: boolean;
  },
  IStateItem
> {
  animatedText: Animated.Value;
  constructor(
    props: IItemProps & {
      form: any;
      errors: IError;
      hiddenRequired?: boolean;
    },
  ) {
    super(props);
    const {
      value,
      defaultValue,
      validateFirst,
      name,
      form = {},
      children,
    } = props;
    if (Array.isArray(children)) {
      throw 'React.Children.only expected to receive a single React element child.';
    }
    const initialValues = {value: value || defaultValue, error: undefined};
    this.state = {
      valueState: {value: value || defaultValue, error: undefined},
      initialValues,
    };
    this.handleRemapItem(props);
    if (name && validateFirst) {
      form.ref[name](initialValues.value);
    }
    this.animatedText = new Animated.Value(0);
  }

  shouldComponentUpdate(
    nProps: IItemProps & {
      form: any;
      errors: IError;
      hiddenRequired?: boolean;
    },
    nState: IStateItem,
  ) {
    const {
      label,
      children,
      dotRequired,
      colon,
      rule,
      formItemLayout,
      checked,
      value,
      errors,
      hiddenRequired,
    } = this.props;
    const {valueState} = this.state;
    return (
      label !== nProps.label ||
      valueState !== nState.valueState ||
      children !== nProps.children ||
      colon !== nProps.colon ||
      rule !== nProps.rule ||
      checked !== nProps.checked ||
      value !== nProps.value ||
      formItemLayout !== nProps.formItemLayout ||
      errors !== nProps.errors ||
      dotRequired !== nProps.dotRequired ||
      hiddenRequired !== nProps.hiddenRequired
    );
  }

  UNSAFE_componentWillReceiveProps(
    nProps: IItemProps & {form: any; errors: IError},
  ) {
    const {name} = this.props;
    if (name !== nProps.name && nProps.name) {
      const valueState = nProps.value || nProps.defaultValue;
      this.handleRemapItem(nProps);
      if (nProps.validateFirst) {
        nProps.form.ref?.[nProps.name]?.(valueState);
      } else {
        this.setState({
          valueState: {value: valueState, error: undefined},
          initialValues: {value: valueState, error: undefined},
        });
      }
    }
  }

  handleRemapItem = (props: IItemProps & {form: any; errors: IError}) => {
    const {
      name,
      onParseField,
      defaultValue,
      onChangeInput,
      rule = {},
      form,
      errors,
      value,
    } = props;
    if (name && onParseField) {
      onParseField(name, defaultValue);
      form.ref[name] = (
        val: string | undefined = undefined,
        error: string,
        detectValidate?: boolean,
      ) => {
        const {initialValues, valueState} = this.state;
        if (!detectValidate && onChangeInput) {
          onChangeInput(val, name);
        }
        if ((val || '') !== (initialValues.value || '')) {
          form.touched[name] = true;
        } else {
          form.touched[name] = false;
        }
        const newValue = {...value, value: val};
        let v = val;
        if (rule.whitespace && v && typeof v === 'string') {
          v = v.trim();
        }
        if (error) {
          newValue.error = error;
        } else if (rule.required && !v) {
          if (rule.message) {
            newValue.error = rule.message;
          } else {
            newValue.error = 'Field is required';
          }
        } else if (
          rule.validator &&
          typeof rule.validator === 'function' &&
          (rule.trigger === 'onChange' || !rule.trigger || detectValidate)
        ) {
          rule.validator(
            v,
            (message: string | undefined) => {
              newValue.error = message;
            },
            form.touched,
          );
        }
        if (newValue.error) {
          if (errors[name] !== newValue.error) {
            errors[name] = newValue.error;
          }
        } else {
          delete errors[name];
        }
        if (valueState.error && !newValue.error) {
          this.animatedText.setValue(0);
        } else if (!valueState.error && newValue.error) {
          Animated.timing(this.animatedText, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }).start();
        }
        this.setState({valueState: newValue});
      };
    }
  };

  layoutItemHandle = ({nativeEvent}: LayoutChangeEvent) => {
    const {form, name} = this.props;
    form.layout[name] = nativeEvent.layout;
  };

  renderWithLabel = (
    styleForm: object | undefined,
    styleSpanCol: object | undefined,
    styleSpanWrapCol: object | undefined,
  ) => {
    const {
      dotRequired,
      rule = {},
      label,
      name,
      colon,
      children,
      onChange,
      onPress,
      onChangeText,
      onValueChange,
      onBlur,
      onBlurInput,
      styles: stylesProps,
      hiddenRequired,
    } = this.props;
    const translateY = this.animatedText.interpolate({
      inputRange: [0, 1],
      outputRange: [-22, 0],
    });
    const {valueState} = this.state;
    return (
      <View style={styleForm} onLayout={this.layoutItemHandle}>
        <View style={styleSpanCol}>
          <View style={styles.Viewlabel}>
            <Text style={[styles.label, stylesProps?.label]}>
              {!hiddenRequired && rule.required && dotRequired === 'before' ? (
                <Text style={styles.dotRequired}>*</Text>
              ) : null}
              {label}
              {!hiddenRequired && rule.required && dotRequired !== 'before' ? (
                <Text style={styles.dotRequiredAfter}>*</Text>
              ) : null}
            </Text>
            <Text style={stylesProps?.colon}>{colon ? ':' : ''}</Text>
          </View>
        </View>
        <View style={styleSpanWrapCol}>
          {{
            ...children,
            props: {
              ...children.props,
              onChange: (v: string) => onChange?.(v, name),
              value: valueState.value,
              error: valueState.error,
              onPress: (e: NativeEventEmitter) =>
                onPress?.(e, children.props.onPress),
              onValueChange: (e: NativeEventEmitter) =>
                onValueChange?.(e, name),
              onChangeText: (e: string) => onChangeText?.(e, name),
              checked: !!valueState.value,
              onBlur: (e: NativeEventEmitter) => {
                if (typeof onBlur === 'function') {
                  onBlur(e);
                }
                if (
                  typeof onBlurInput === 'function' &&
                  rule.trigger === 'blur'
                ) {
                  onBlurInput(name, valueState.value);
                }
              },
            },
          }}
          <View style={styles.error} removeClippedSubviews>
            <TextAnimated
              style={[
                styles.textError,
                {
                  transform: [{scaleY: this.animatedText}, {translateY}],
                  opacity: this.animatedText,
                },
                stylesProps?.error,
              ]}>
              {valueState.error}
            </TextAnimated>
          </View>
        </View>
      </View>
    );
  };

  render() {
    const {
      children,
      name,
      onChange,
      onPress = () => null,
      rule = {},
      onValueChange,
      onChangeText,
      label,
      onBlurInput,
      onBlur,
      styles: stylesProps,
    } = this.props;
    const {valueState} = this.state;
    if (label) {
      return this.renderWithLabel(undefined, undefined, undefined);
    }
    const translateY = this.animatedText.interpolate({
      inputRange: [0, 1],
      outputRange: [-22, 0],
    });

    return (
      <View>
        {{
          ...children,
          props: {
            ...children.props,
            onChange: (v: string) => onChange?.(v, name),
            value: valueState.value,
            error: valueState.error,
            onPress: (e: NativeEventEmitter) =>
              onPress(e, children.props.onPress),
            onValueChange: (e: NativeEventEmitter) => onValueChange?.(e, name),
            onChangeText: (e: NativeEventEmitter) => onChangeText?.(e, name),
            checked: !!valueState.value,
            onBlur: (e: NativeEventEmitter) => {
              if (typeof onBlur === 'function') {
                onBlur(e);
              }
              if (
                typeof onBlurInput === 'function' &&
                rule.trigger === 'blur'
              ) {
                onBlurInput(name, valueState.value);
              }
            },
          },
        }}
        <View style={styles.error} removeClippedSubviews>
          <TextAnimated
            style={[
              styles.textError,
              {
                transform: [{scaleY: this.animatedText}, {translateY}],
                opacity: this.animatedText,
              },
              stylesProps?.error,
            ]}>
            {valueState.error}
          </TextAnimated>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  label: {},
  Viewlabel: {
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotRequired: {
    color: '#ff4d4f',
    marginRight: 4,
  },
  dotRequiredAfter: {
    color: '#ff4d4f',
    marginRight: 2,
    marginLeft: 2,
  },
  layoutForm: {
    flexDirection: 'row',
  },
  styleSpanCol: {
    minHeight: 34,
    paddingTop: 8.5,
    paddingBottom: 8.5,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 8,
  },
  error: {
    overflow: 'hidden',
  },
  textError: {
    fontSize: 12,
    color: '#ff4d4f',
    minHeight: 22,
    paddingBottom: 5,
    fontWeight: '500',
  },
});

export default Item;
