type NonPrimitiveCondition = RegExp | Promise<void>;
export type Condition = string | NonPrimitiveCondition;

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

export function isConditionPromise(
  condition: Condition | undefined
): condition is Promise<void> {
  return condition instanceof Promise;
}
