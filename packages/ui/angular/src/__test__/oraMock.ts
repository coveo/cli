type Spinner = {
  clear(): Spinner;
  fail(): Spinner;
  info(): Spinner;
  isSpinning: boolean;
  render(): Spinner;
  start(): Spinner;
  stop(): Spinner;
  stopAndPersist(): Spinner;
  succeed(): Spinner;
  text: string;
  warn(): Spinner;
};

const createSpinner = (): Spinner => ({
  clear() {
    return this;
  },
  fail() {
    return this;
  },
  info() {
    return this;
  },
  isSpinning: false,
  render() {
    return this;
  },
  start() {
    this.isSpinning = true;
    return this;
  },
  stop() {
    this.isSpinning = false;
    return this;
  },
  stopAndPersist() {
    return this.stop();
  },
  succeed() {
    return this;
  },
  text: '',
  warn() {
    return this;
  },
});

const ora = Object.assign(() => createSpinner(), {
  async oraPromise<T>(
    action: Promise<T> | (() => Promise<T>),
    _options?: unknown
  ) {
    return typeof action === 'function' ? action() : action;
  },
});

export default ora;
