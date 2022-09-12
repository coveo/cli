import {fancy} from 'fancy-test';

/**
 * Wrapper around `jest.it` that captures all stdout/stderr.
 */
export const fancyIt = () => fancy.stdout().stderr().it;
