import { render } from '@testing-library/react';
import { AppStateProvider } from '../../../contexts/app-state/app-state-provider';
import { EpochTotalRewardsTable } from './epoch-total-rewards-table';
import { AccountType } from '@vegaprotocol/types';

const mockData = {
  epoch: 4431,
  assetRewards: [
    {
      assetId:
        'b340c130096819428a62e5df407fd6abe66e444b89ad64f670beb98621c9c663',
      name: 'tDAI TEST',
      rewards: [
        {
          rewardType: AccountType.ACCOUNT_TYPE_GLOBAL_REWARD,
          amount: '0',
        },
        {
          rewardType: AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
          amount: '295',
        },
        {
          rewardType: AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
          amount: '0',
        },
        {
          rewardType: AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES,
          amount: '0',
        },
        {
          rewardType: AccountType.ACCOUNT_TYPE_FEES_LIQUIDITY,
          amount: '0',
        },
        {
          rewardType: AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS,
          amount: '0',
        },
      ],
      totalAmount: '295',
    },
  ],
};

describe('EpochTotalRewardsTable', () => {
  it('should render correctly', () => {
    const { getByTestId } = render(
      <AppStateProvider>
        <EpochTotalRewardsTable data={mockData} />
      </AppStateProvider>
    );
    expect(getByTestId('epoch-total-rewards-table')).toBeInTheDocument();
    expect(getByTestId('asset')).toBeInTheDocument();
    expect(getByTestId('ACCOUNT_TYPE_GLOBAL_REWARD')).toBeInTheDocument();
    expect(getByTestId('ACCOUNT_TYPE_FEES_INFRASTRUCTURE')).toBeInTheDocument();
    expect(
      getByTestId('ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES')
    ).toBeInTheDocument();
    expect(
      getByTestId('ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES')
    ).toBeInTheDocument();
    expect(getByTestId('ACCOUNT_TYPE_FEES_LIQUIDITY')).toBeInTheDocument();
    expect(
      getByTestId('ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS')
    ).toBeInTheDocument();
    expect(getByTestId('total')).toBeInTheDocument();
  });
});
