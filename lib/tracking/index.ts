export { Tracker, getTracker, initTracker } from './core/tracker';
export { eventQueue } from './core/event-queue';
export { normalizeEvent } from './core/event-normalizer';
export { AutoTrackers } from './core/auto-trackers';

export { MetaPixelAdapter } from './adapters/meta-pixel';
export { GoogleAnalyticsAdapter } from './adapters/google-analytics';
export { GoogleAdsAdapter } from './adapters/google-ads';
export { BaseAdapter } from './adapters/base-adapter';

export type {
  TrackingEvent,
  TrackingConfig,
  EventType,
  IAdapter,
  AdapterConfig,
  PageInfo,
  UserInfo,
  EventMetadata,
  ApiResponse,
  EventStats,
} from './types/events';

export { trackingConfig, validateConfig } from '../tracking-config';

