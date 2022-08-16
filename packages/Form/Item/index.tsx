import {FormControlProvider, FormProps, FormValues} from '@/provider';
import Text from '@/Text';
import {color} from '@/utils';
import React, {Component} from 'react';
import {LayoutChangeEvent, StyleSheet, View} from 'react-native';
import {
  FormItem,
  FormControl,
  TriggerAction,
  FormItemDefault,
  Rule,
} from '../types';
import {validate} from '../validateItem';
import ItemChild from './components/ItemChild';

interface PropsItem extends FormItemDefault {
  validateFirst?: boolean;
  getValueProps?: (value: any) => any;
  valuePropName?: 'number' | 'string' | 'checked';
}

class Item extends Component<FormItem> {
  componentWillUnmount() {
    const {name, preserve} = this.props;
    if (!preserve) {
      const {clearField} = this.context as FormControl;
      clearField(name);
    }
  }

  UNSAFE_componentWillReceiveProps(nProps: FormItem) {
    const {name, required, rules} = this.props;
    if (
      name !== nProps.name ||
      required !== nProps.required ||
      rules !== nProps.rules
    ) {
      const {clearField, renameLayout} = this.context as FormControl;
      if (renameLayout && name !== nProps.name) {
        renameLayout(name, nProps.name);
      }
      clearField(name, nProps.name);
    }
  }

  initItem = (value: any, props: PropsItem = this.props) => {
    const {
      validateFirst,
      name,
      label,
      rules,
      required,
      validateTrigger,
      getValueProps = v => v,
      valuePropName,
    } = props;
    const {setField, validateField} = this.context as FormControl;
    let funCall = setField;
    if (validateFirst && (rules?.length || required)) {
      funCall = validateField;
    }
    funCall({
      value: valuePropName === 'checked' ? !!value : getValueProps(value),
      propsItem: {name, label, rules, required, validateTrigger},
    });
  };

  onChangeValue = async (value: any) => {
    const {onChangeValue} = this.context as FormControl;
    const {rules, name, label, required, validateTrigger} = this.props;
    const errors = await validate(
      this.renderValue(value),
      {rules, name, label, required, validateTrigger},
      TriggerAction.onChange,
    );
    onChangeValue({
      value: this.renderValue(value),
      validating: rules?.length ? true : undefined,
      name,
      error: errors?.[0],
    });
  };

  renderValue = (value: any) => {
    const {getValueProps, valuePropName} = this.props;
    if (getValueProps) {
      return getValueProps(value);
    }
    if (valuePropName === 'checked') {
      return !!value;
    }
    if (valuePropName === 'number') {
      return value ? Number(value) : value;
    }
    return value;
  };

  renderLabelRequired = (mark?: boolean | string) => {
    if (mark === undefined || mark === true) {
      return '*';
    }
    return mark;
  };

  getRequire = () => {
    const {required, rules} = this.props;
    return required || rules?.some(rule => rule.required);
  };

  setLayout = (event: LayoutChangeEvent) => {
    const {name} = this.props;
    const {setLayout} = this.context as FormControl;
    setLayout?.({name: name, layout: event.nativeEvent.layout});
  };

  garenateRules = (rules?: Rule[]) => {
    const {rules: rulesProps} = this.props;
    if (rulesProps?.length) {
      return [...(rules || []), ...rulesProps];
    }
    return rules;
  };

  onBlur = () => {
    const {name} = this.props;
    const {blurValidate} = this.context as FormControl;
    blurValidate?.(name);
  };

  render() {
    const {
      children,
      name,
      label,
      labelAlign,
      labelStyle,
      initialValue,
      hidden,
      ...props
    } = this.props;
    if (hidden) {
      return null;
    }
    const required = this.getRequire();
    return (
      <View onLayout={this.setLayout}>
        <FormProps.Consumer>
          {({
            colon,
            requiredMark,
            requiredMarkStyle: markStyle,
            requiredMarkPosition: pos = 'before',
          }) => {
            const mark = this.renderLabelRequired(requiredMark);
            return (
              <Text style={[styles.label, {textAlign: labelAlign}, labelStyle]}>
                {pos === 'before' && required ? (
                  <Text style={[styles.mark, markStyle]}>{`${mark} `}</Text>
                ) : null}
                {label}
                {pos === 'after' && required ? (
                  <Text style={[styles.mark, markStyle]}>{` ${mark}`}</Text>
                ) : null}
                {colon ? ':' : ''}
              </Text>
            );
          }}
        </FormProps.Consumer>
        <FormValues.Consumer>
          {({
            values,
            errors,
            touched,
            validating,
            forceUpdate,
            initialValues,
            fields,
          }) => {
            return (
              <ItemChild
                onBlur={this.onBlur}
                validateFirst={props.validateFirst}
                name={name}
                label={label}
                rules={this.garenateRules(fields?.[name]?.rules)}
                required={required}
                validateTrigger={props.validateTrigger}
                getValueProps={props.getValueProps}
                valuePropName={props.valuePropName}
                value={values?.[name]}
                initialValue={
                  initialValues?.[name] === undefined
                    ? initialValue
                    : initialValues?.[name]
                }
                forceUpdate={forceUpdate}
                error={errors?.[name]}
                touched={!!touched?.[name]}
                validating={!!validating?.[name]}
                onChangeValue={this.onChangeValue}
                initItem={this.initItem}>
                {children}
              </ItemChild>
            );
          }}
        </FormValues.Consumer>
      </View>
    );
  }
}

Item.contextType = FormControlProvider;

export default Item;

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  mark: {
    color: color.danger,
    fontSize: 14,
  },
});
