import {getPassword, setPassword} from 'keytar';
import {userInfo} from 'os';

export class Storage {
  public async get(): Promise<{
    accessToken: string | null;
  }> {
    const accessToken = await this.getAccessToken();
    return {accessToken};
  }

  public async save(accessToken: string) {
    await this.setAccessToken(accessToken);
  }

  private get serviceName() {
    return 'com.coveo.cli';
  }

  private get serviceNameAccessToken() {
    return `${this.serviceName}.access.token`;
  }

  private getAccessToken() {
    const currentAccount = userInfo().username;
    return getPassword(this.serviceNameAccessToken, currentAccount);
  }

  private setAccessToken(tok: string) {
    const currentAccount = userInfo().username;
    return setPassword(this.serviceNameAccessToken, currentAccount, tok);
  }
}
