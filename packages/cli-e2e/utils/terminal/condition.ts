export type Condition = RegExp | string;

export function isConditionRegExp(
  condition: Condition | undefined
): condition is RegExp {
  return condition instanceof RegExp;
}

export function isConditionString(
  condition: Condition | undefined
): condition is string {
  return typeof condition === 'string';
}
