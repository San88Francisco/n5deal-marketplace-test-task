import { ASSET_STATUS, PUBLIC_ASSET_STATUSES, USER_STATUS } from "@/constants";
import type { AssetStatus, UserStatus } from "@/types";

const LIVE_ASSET_STATUSES: readonly AssetStatus[] = [
  ASSET_STATUS.PUBLISHED,
  ASSET_STATUS.UNDER_OFFER,
];

export const isPublicAssetStatus = (status: AssetStatus): boolean =>
  (PUBLIC_ASSET_STATUSES as readonly AssetStatus[]).includes(status);

export const isLiveAssetStatus = (status: AssetStatus): boolean =>
  LIVE_ASSET_STATUSES.includes(status);

export const isActive = (status: UserStatus): boolean => status === USER_STATUS.ACTIVE;
