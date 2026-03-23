import {
  defaultValidateMessages,
  FormItem,
  TriggerAction,
  ValidateMessages,
} from './types';

const isEmpty = (value: any) => !value && value !== 0 && value !== false;

const formatMessage = (
  template: string,
  replacements: Record<string, string>,
) => {
  let result = template;
  for (const key in replacements) {
    result = result.replace(`{{${key}}}`, replacements[key]);
  }
  return result;
};

export const validate = async (
  value: any,
  props: Pick<
    FormItem,
    'rules' | 'required' | 'name' | 'label' | 'validateTrigger' | 'messageError'
  >,
  trigger: TriggerAction = TriggerAction.onChange,
  validateMessages?: ValidateMessages,
): Promise<undefined | string[]> => {
  const messages = {...defaultValidateMessages, ...validateMessages};
  const {
    rules,
    required,
    name,
    label,
    validateTrigger = TriggerAction.onChange,
    messageError,
  } = props;
  const fieldName = String(label || name || 'Field');

  if (!rules?.length && !required) {
    return undefined;
  }
  if (
    required &&
    isEmpty(value) &&
    [TriggerAction.all, validateTrigger].includes(trigger!)
  ) {
    return [
      messageError ?? formatMessage(messages.required, {name: fieldName}),
    ];
  }
  const errors: (string | undefined)[] = await Promise.all(
    (rules || []).map(async rule => {
      const {
        transform,
        pattern,
        message,
        validateTrigger: triggerRule = validateTrigger,
      } = rule;
      if (trigger !== triggerRule && trigger !== TriggerAction.all) {
        return undefined;
      }
      let newValue = value;
      if (typeof transform === 'function') {
        newValue = transform(value);
      }
      if (rule.required && isEmpty(newValue)) {
        return message || formatMessage(messages.required, {name: fieldName});
      }
      if (
        rule.whitespace &&
        String(newValue || '') !== '' &&
        !String(newValue || '').trim()
      ) {
        return message || formatMessage(messages.whitespace, {name: fieldName});
      }
      if (rule.enum && Array.isArray(rule.enum)) {
        if (!rule.enum.includes(newValue)) {
          return (
            message ||
            formatMessage(messages.enum, {
              name: fieldName,
              enum: `[${rule.enum.join(', ')}]`,
            })
          );
        }
      }
      if (
        typeof rule.len === 'number' &&
        newValue != null &&
        newValue.length !== rule.len
      ) {
        return (
          message ||
          formatMessage(messages.len, {name: fieldName, len: String(rule.len)})
        );
      }
      if (
        typeof rule.max === 'number' &&
        typeof newValue === 'number' &&
        newValue > rule.max
      ) {
        return (
          message ||
          formatMessage(messages.max, {name: fieldName, max: String(rule.max)})
        );
      }
      if (
        typeof rule.min === 'number' &&
        typeof newValue === 'number' &&
        newValue < rule.min
      ) {
        return (
          message ||
          formatMessage(messages.min, {name: fieldName, min: String(rule.min)})
        );
      }
      if (
        pattern &&
        typeof pattern.test === 'function' &&
        newValue != null &&
        !pattern.test(String(newValue))
      ) {
        return (
          message ||
          formatMessage(messages.pattern, {
            name: fieldName,
            pattern: String(pattern),
          })
        );
      }
      if (typeof rule.validator === 'function') {
        try {
          await new Promise((resolve, reject) => {
            rule
              .validator?.(
                {...rule, name: name as string},
                newValue,
                (messageErr?: string) => {
                  if (messageErr) {
                    reject(new Error(messageErr));
                  } else {
                    resolve(undefined);
                  }
                },
              )
              ?.then?.(() => resolve(undefined))
              ?.catch?.(reject);
          });
        } catch (e: any) {
          return e.message || e;
        }
      }
    }),
  );
  if (errors.length && errors.every(e => e === undefined)) return undefined;
  return errors.filter(Boolean) as string[];
};
