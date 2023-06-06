import {z} from 'zod';

export const isAggregatedErrorLike = (error: any): error is AggregateError =>
  AggregateErrorLike.safeParse(error).success;

const AggregateErrorLike = z.object({
  name: z.literal('AggregateError'),
  errors: z.array(z.string()),
  message: z.string(),
});

export const isErrorLike = (error: any): error is Error =>
  ErrorLike.safeParse(error).success;

const ErrorLike = z.object({
  name: z.string(),
  message: z.string(),
});
