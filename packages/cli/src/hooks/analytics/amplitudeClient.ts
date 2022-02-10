import {init, NodeClient} from '@amplitude/node';

const analyticsAPIKey = 'af28cba7acfd392c324bebd399e2d9ea';

export interface AmplitudeClient extends NodeClient {
  identified: boolean;
}

// TODO: CDX-667: support proxy
export const amplitudeClient = init(analyticsAPIKey);
