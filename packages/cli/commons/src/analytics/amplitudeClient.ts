import {init} from '@amplitude/analytics-node';
export {flush, track} from '@amplitude/analytics-node';

const analyticsAPIKey = 'af28cba7acfd392c324bebd399e2d9ea';

// TODO: CDX-667: support proxy
init(analyticsAPIKey);
