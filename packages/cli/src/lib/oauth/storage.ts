import {getPassword, setPassword} from 'keytar';
import {userInfo} from 'os';

export class Storage {
  public async get(): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
  }> {
    const accessToken = await this.getAccessToken();
    const refreshToken = await this.getRefreshToken();
    return {accessToken, refreshToken};
  }

  public async save(accessToken: string, refreshToken: string) {
    await this.setAccessToken(accessToken);
    await this.setRefreshToken(refreshToken);
  }

  private get serviceName() {
    return 'com.coveo.cli';
  }

  private get serviceNameAccessToken() {
    return `${this.serviceName}.access.token`;
  }
  private get serviceNameRefreshToken() {
    return `${this.serviceName}.refresh.token`;
  }

  private getAccessToken() {
    const currentAccount = userInfo().username;
    return getPassword(this.serviceNameAccessToken, currentAccount);
  }

  private getRefreshToken() {
    const currentAccount = userInfo().username;
    return getPassword(this.serviceNameRefreshToken, currentAccount);
  }

  private setAccessToken(tok: string) {
    const currentAccount = userInfo().username;
    return setPassword(this.serviceNameAccessToken, currentAccount, tok);
  }

  private setRefreshToken(tok: string) {
    const currentAccount = userInfo().username;
    return setPassword(this.serviceNameRefreshToken, currentAccount, tok);
  }
}
