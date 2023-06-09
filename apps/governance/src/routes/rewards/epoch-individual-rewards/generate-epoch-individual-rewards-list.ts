import { BigNumber } from '../../../lib/bignumber';
import { RowAccountTypes } from '../shared-rewards-table-assets/shared-rewards-table-assets';
import type { RewardFieldsFragment } from '../home/__generated__/Rewards';
import type { AccountType } from '@vegaprotocol/types';

export interface EpochIndividualReward {
  epoch: string;
  rewards: {
    asset: string;
    totalAmount: string;
    rewardTypes: {
      [key in AccountType]?: {
        amount: string;
        percentageOfTotal: string;
      };
    };
  }[];
}

const accountTypes = Object.keys(RowAccountTypes);

const emptyRowAccountTypes = accountTypes.map((type) => [
  type,
  {
    amount: '0',
    percentageOfTotal: '0',
  },
]);

export const generateEpochIndividualRewardsList = (
  rewards: RewardFieldsFragment[]
) => {
  // We take the rewards and aggregate them by epoch and asset.
  const epochIndividualRewards = rewards.reduce((map, reward) => {
    const epochId = reward.epoch.id;
    const assetName = reward.asset.name;
    const rewardType = reward.rewardType;
    const amount = reward.amount;
    const percentageOfTotal = reward.percentageOfTotal;

    // if the rewardType is not of a type we display in the table, we skip it.
    if (!accountTypes.includes(rewardType)) {
      return map;
    }

    if (!map.has(epochId)) {
      map.set(epochId, { epoch: epochId, rewards: [] });
    }

    const epoch = map.get(epochId);

    let asset = epoch?.rewards.find((r) => r.asset === assetName);

    if (!asset) {
      asset = {
        asset: assetName,
        totalAmount: '0',
        rewardTypes: Object.fromEntries(emptyRowAccountTypes),
      };
      epoch?.rewards.push(asset);
    }

    asset.rewardTypes[rewardType] = { amount, percentageOfTotal };

    // totalAmount is the sum of all rewardTypes amounts
    asset.totalAmount = Object.values(asset.rewardTypes).reduce(
      (sum, rewardType) => {
        return new BigNumber(sum).plus(rewardType.amount).toString();
      },
      '0'
    );

    if (epoch) {
      epoch.rewards = epoch.rewards.sort((a, b) => {
        return new BigNumber(b.totalAmount).comparedTo(a.totalAmount);
      });
    }

    return map;
  }, new Map<string, EpochIndividualReward>());

  return Array.from(epochIndividualRewards.values()).sort(
    (a, b) => Number(b.epoch) - Number(a.epoch)
  );
};
