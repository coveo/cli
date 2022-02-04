import {Interfaces} from '@oclif/core';

class GlobalConfig {
  private config?: Interfaces.Config;
  public set(config: Interfaces.Config) {
    this.config = config;
  }
  public get(): Interfaces.Config {
    if (!this.config) {
      throw new Error('Global config not defined');
    }
    return this.config;
  }
}

export default new GlobalConfig();
