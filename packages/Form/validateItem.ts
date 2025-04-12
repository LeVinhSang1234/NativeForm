import {
  defaultValidateMessages,
  FormItem,
  TriggerAction,
  ValidateMessages,
} from './types';

export const validate = async (
  value: any,
  props: Pick<
    FormItem,
    'rules' | 'required' | 'name' | 'label' | 'validateTrigger'
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
  } = props;
  if (!rules?.length && !required) {
    return undefined;
  }
  if (
    required &&
    !value &&
    [TriggerAction.all, validateTrigger].includes(trigger!)
  ) {
    return [messages.required.replace('${name}', label || name || 'Field')];
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
      if (rule.required) {
        if (!newValue && newValue !== 0 && newValue !== false) {
          return (
            message ||
            messages.required.replace('${name}', label || name || 'Field')
          );
        }
        return undefined;
      }
      if (
        rule.whitespace &&
        String(newValue || '') !== '' &&
        !String(newValue || '').trim()
      ) {
        return (
          message ||
          messages.whitespace.replace('${name}', label || name || 'Field')
        );
      }
      if (rule.enum && Array.isArray(rule.enum)) {
        if (!rule.enum?.find(en => en === newValue)) {
          return (
            message ||
            messages.enum
              .replace('${name}', label || name || 'Field')
              .replace('${enum}', `[${rule.enum.join(', ')}]`)
          );
        }
      }
      if (typeof rule.len === 'number' && newValue?.length > rule.len) {
        return (
          message ||
          messages.len
            .replace('$name', label || name || 'Field')
            .replace('${len}', String(rule.len))
        );
      }
      if (
        typeof rule.max === 'number' &&
        typeof newValue === 'number' &&
        newValue > rule.max
      ) {
        return (
          message ||
          messages.max
            .replace('${name}', label || name || 'Field')
            .replace('${max}', String(rule.max))
        );
      }
      if (
        typeof rule.min === 'number' &&
        typeof newValue === 'number' &&
        newValue < rule.min
      ) {
        return (
          message ||
          messages.min
            .replace('${name}', label || name || 'Field')
            .replace('${min}', String(rule.min))
        );
      }
      if (
        pattern &&
        typeof pattern.test === 'function' &&
        !pattern.test(newValue)
      ) {
        return (
          message ||
          messages.pattern
            .replace('$name', label || name || 'Field')
            .replace('${pattern}', String(pattern))
        );
      }
      if (typeof rule.validator === 'function') {
        try {
          await new Promise((reslove, reject) => {
            rule
              .validator?.({...rule, name}, newValue, (messageErr?: string) => {
                if (messageErr) {
                  reject(new Error(messageErr));
                } else {
                  reslove(undefined);
                }
              })
              ?.then?.(() => reslove(undefined))
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
