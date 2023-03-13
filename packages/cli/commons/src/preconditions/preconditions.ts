import {Before} from '../decorators/before';
import { DecoratorFunction } from '../decorators/decoratorFunction';

/**
 * @deprecated use @type {DecoratorFunction}
 */
export type PreconditionFunction = DecoratorFunction;

/**
 * @deprecated use @function {Before}
 */
export const Preconditions = Before;
