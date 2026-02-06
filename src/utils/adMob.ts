import { useEffect, useState, useCallback } from 'react';
import Constants from 'expo-constants';

// Check if we're running in Expo Go (no native module support)
const isExpoGo = Constants.appOwnership === 'expo';

// Only import native ads module if not in Expo Go
let RewardedAd: any = null;
let RewardedAdEventType: any = null;
let TestIds: any = null;

if (!isExpoGo) {
  try {
    const ads = require('react-native-google-mobile-ads');
    RewardedAd = ads.RewardedAd;
    RewardedAdEventType = ads.RewardedAdEventType;
    TestIds = ads.TestIds;
  } catch (e) {
    console.log('Google Mobile Ads not available');
  }
}

// Test ID for development, real ID for production
const REWARDED_AD_UNIT_ID = __DEV__ && TestIds
  ? TestIds.REWARDED
  : 'ca-app-pub-3360703241617260/6171582988';

let rewardedAd: any = null;

function getRewardedAd(): any {
  if (!RewardedAd) return null;

  if (!rewardedAd) {
    rewardedAd = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: true,
    });
  }
  return rewardedAd;
}

export function useRewardedAd() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if ads are available (not in Expo Go)
  const adsAvailable = !isExpoGo && RewardedAd !== null;

  const loadAd = useCallback(() => {
    // Skip if ads not available (Expo Go)
    if (!adsAvailable) {
      setError('Ads not available in Expo Go');
      return;
    }

    if (isLoading || isLoaded) return;

    setIsLoading(true);
    setError(null);

    const ad = getRewardedAd();
    if (!ad) {
      setIsLoading(false);
      setError('Ad module not available');
      return;
    }

    const unsubscribeLoaded = ad.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        setIsLoaded(true);
        setIsLoading(false);
      }
    );

    const unsubscribeError = ad.addAdEventListener(
      'error' as any,
      (err: any) => {
        setError(err?.message || 'Failed to load ad');
        setIsLoading(false);
        setIsLoaded(false);
      }
    );

    ad.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeError();
    };
  }, [isLoading, isLoaded, adsAvailable]);

  const showAd = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!adsAvailable || !isLoaded) {
        resolve(false);
        return;
      }

      const ad = getRewardedAd();
      if (!ad) {
        resolve(false);
        return;
      }

      const unsubscribeEarned = ad.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          // User earned the reward
          resolve(true);
        }
      );

      const unsubscribeClosed = ad.addAdEventListener(
        'closed' as any,
        () => {
          // Ad was closed - cleanup
          unsubscribeEarned();
          unsubscribeClosed();
          setIsLoaded(false);

          // Reset the ad instance for next load
          rewardedAd = null;
        }
      );

      ad.show().catch(() => {
        unsubscribeEarned();
        unsubscribeClosed();
        resolve(false);
      });
    });
  }, [isLoaded, adsAvailable]);

  // Load ad on mount (only if ads available)
  useEffect(() => {
    if (adsAvailable) {
      loadAd();
    }
  }, [adsAvailable]);

  return {
    isLoaded,
    isLoading,
    error,
    loadAd,
    showAd,
  };
}

// Simple function to preload ad without hook
export async function preloadRewardedAd(): Promise<void> {
  // Skip if ads not available (Expo Go)
  if (isExpoGo || !RewardedAd) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const ad = getRewardedAd();
    if (!ad) {
      resolve();
      return;
    }

    const unsubscribeLoaded = ad.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        unsubscribeLoaded();
        resolve();
      }
    );

    const unsubscribeError = ad.addAdEventListener(
      'error' as any,
      (err: any) => {
        unsubscribeError();
        reject(err);
      }
    );

    ad.load();
  });
}

export async function showRewardedAd(): Promise<boolean> {
  // Skip if ads not available (Expo Go)
  if (isExpoGo || !RewardedAd) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const ad = getRewardedAd();
    if (!ad) {
      resolve(false);
      return;
    }

    let rewarded = false;

    const unsubscribeEarned = ad.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        rewarded = true;
      }
    );

    const unsubscribeClosed = ad.addAdEventListener(
      'closed' as any,
      () => {
        unsubscribeEarned();
        unsubscribeClosed();
        rewardedAd = null;
        resolve(rewarded);
      }
    );

    ad.show().catch(() => {
      unsubscribeEarned();
      unsubscribeClosed();
      resolve(false);
    });
  });
}
