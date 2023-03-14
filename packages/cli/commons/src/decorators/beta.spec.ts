jest.mock('../platform/authenticatedClient');
jest.mock('../config/globalConfig');
jest.mock('../config/config');

import {fancyIt} from '@coveo/cli-commons-dev/testUtils/it';
import {getFakeCommand} from '../utils/getFakeCommand';
import {Beta} from './beta';

describe('beta', () => {
  const fakeCommand = getFakeCommand();
  jest.fn();
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  fancyIt()(`warns that the command is in beta`, async () => {
    await Beta()(fakeCommand);
    expect(fakeCommand.warn).toBeCalledTimes(1);
    expect((fakeCommand.warn as jest.Mock).mock.lastCall).toMatchSnapshot();
  });
});
