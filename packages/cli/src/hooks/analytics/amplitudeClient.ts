import {init, NodeClient} from '@amplitude/node';

// TODO: CDX-656: replace with Production API key on build
const analyticsAPIKey = '2b06992f1a80d36396ba7297a8daf913';

export interface AmplitudeClient extends NodeClient {
  identified: boolean;
}

// TODO: CDX-667: support proxy
export const amplitudeClient = init(analyticsAPIKey);
