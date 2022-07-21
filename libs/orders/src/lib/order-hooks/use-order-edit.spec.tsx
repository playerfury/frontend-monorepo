import { act, renderHook } from '@testing-library/react-hooks';
import type {
  VegaKeyExtended,
  VegaWalletContextShape,
} from '@vegaprotocol/wallet';
import {
  VegaWalletOrderSide,
  VegaWalletOrderTimeInForce,
  VegaWalletOrderType,
} from '@vegaprotocol/wallet';
import { VegaTxStatus, VegaWalletContext } from '@vegaprotocol/wallet';
import type { ReactNode } from 'react';
import { useOrderEdit } from './use-order-edit';
import type {
  OrderEvent,
  OrderEvent_busEvents,
} from './__generated__/OrderEvent';
import { ORDER_EVENT_SUB } from './order-event-query';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import {
  MarketTradingMode,
  MarketState,
  OrderTimeInForce,
} from '@vegaprotocol/types';
import type {
  OrderAmendmentBodyOrderAmendment,
  OrderAmendmentBody,
} from '@vegaprotocol/vegawallet-service-api-client';

const defaultWalletContext = {
  keypair: null,
  keypairs: [],
  sendTx: jest.fn().mockReturnValue(Promise.resolve(null)),
  connect: jest.fn(),
  disconnect: jest.fn(),
  selectPublicKey: jest.fn(),
  connector: null,
};

function setup(context?: Partial<VegaWalletContextShape>) {
  const mocks: MockedResponse<OrderEvent> = {
    request: {
      query: ORDER_EVENT_SUB,
      variables: {
        partyId: context?.keypair?.pub || '',
      },
    },
    result: {
      data: {
        busEvents: [
          {
            type: 'Order',
            event: {
              type: 'Limit',
              id: '9c70716f6c3698ac7bbcddc97176025b985a6bb9a0c4507ec09c9960b3216b62',
              status: 'Active',
              rejectionReason: null,
              createdAt: '2022-07-05T14:25:47.815283706Z',
              size: '10',
              price: '300000',
              timeInForce: 'GTC',
              side: 'Buy',
              market: {
                name: 'UNIDAI Monthly (30 Jun 2022)',
                decimalPlaces: 5,
                __typename: 'Market',
              },
              __typename: 'Order',
            },
            __typename: 'BusEvent',
          } as OrderEvent_busEvents,
        ],
      },
    },
  };
  const filterMocks: MockedResponse<OrderEvent> = {
    request: {
      query: ORDER_EVENT_SUB,
      variables: {
        partyId: context?.keypair?.pub || '',
      },
    },
    result: {
      data: {
        busEvents: [
          {
            type: 'Order',
            event: {
              type: 'Limit',
              id: '9c70716f6c3698ac7bbcddc97176025b985a6bb9a0c4507ec09c9960b3216b62',
              status: 'Active',
              rejectionReason: null,
              createdAt: '2022-07-05T14:25:47.815283706Z',
              size: '10',
              price: '300000',
              timeInForce: 'GTC',
              side: 'Buy',
              market: {
                name: 'UNIDAI Monthly (30 Jun 2022)',
                decimalPlaces: 5,
                __typename: 'Market',
              },
              __typename: 'Order',
            },
            __typename: 'BusEvent',
          } as OrderEvent_busEvents,
        ],
      },
    },
  };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={[mocks, filterMocks]}>
      <VegaWalletContext.Provider
        value={{ ...defaultWalletContext, ...context }}
      >
        {children}
      </VegaWalletContext.Provider>
    </MockedProvider>
  );
  return renderHook(() => useOrderEdit(), { wrapper });
}

const defaultMarket = {
  __typename: 'Market',
  id: 'market-id',
  decimalPlaces: 2,
  positionDecimalPlaces: 1,
  tradingMode: MarketTradingMode.Continuous,
  state: MarketState.Active,
  tradableInstrument: {
    __typename: 'TradableInstrument',
    instrument: {
      __typename: 'Instrument',
      product: {
        __typename: 'Future',
        quoteName: 'quote-name',
      },
    },
  },
  depth: {
    __typename: 'MarketDepth',
    lastTrade: {
      __typename: 'Trade',
      price: '100',
    },
  },
};

const order = {
  id: 'order-id',
  type: VegaWalletOrderType.Limit,
  size: '10',
  timeInForce: OrderTimeInForce.GTT, // order timeInForce is transformed to wallet timeInForce
  side: VegaWalletOrderSide.Buy,
  price: '1234567.89',
  expiration: new Date('2022-01-01'),
  expiresAt: new Date('2022-01-01'),
  status: VegaTxStatus.Pending,
  rejectionReason: null,
  market: {
    id: 'market-id',
    decimalPlaces: 2,
    name: 'ETHDAI',
    positionDecimalPlaces: 2,
  },
};

describe('useOrderEdit', () => {
  it('should edit a correctly formatted order', async () => {
    const mockSendTx = jest.fn().mockReturnValue(Promise.resolve({}));
    const keypair = {
      pub: '0x123',
    } as VegaKeyExtended;
    const { result } = setup({
      sendTx: mockSendTx,
      keypairs: [keypair],
      keypair,
    });

    await act(async () => {
      result.current.edit(order);
    });

    expect(mockSendTx).toHaveBeenCalledWith({
      pubKey: keypair.pub,
      propagate: true,
      orderAmendment: {
        orderId: 'order-id',
        marketId: defaultMarket.id, // Market provided from hook argument
        timeInForce: VegaWalletOrderTimeInForce.GTT,
        price: { value: '123456789' }, // Decimal removed
        sizeDelta: 0,
        expiresAt: { value: order.expiration?.getTime() + '000000' }, // Nanoseconds append
      } as unknown as OrderAmendmentBodyOrderAmendment,
    } as OrderAmendmentBody);
  });

  it('has the correct default state', () => {
    const { result } = setup();
    expect(typeof result.current.edit).toEqual('function');
    expect(typeof result.current.reset).toEqual('function');
    expect(result.current.transaction.status).toEqual(VegaTxStatus.Default);
    expect(result.current.transaction.txHash).toEqual(null);
    expect(result.current.transaction.error).toEqual(null);
  });

  it('should not sendTx if no keypair', async () => {
    const mockSendTx = jest.fn();
    const { result } = setup({
      sendTx: mockSendTx,
      keypairs: [],
      keypair: null,
    });
    await act(async () => {
      result.current.edit(order);
    });
    expect(mockSendTx).not.toHaveBeenCalled();
  });
});