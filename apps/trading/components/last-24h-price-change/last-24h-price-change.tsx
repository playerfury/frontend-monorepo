import type { RefObject } from 'react';
import { useInView } from 'react-intersection-observer';
import { isNumeric } from '@vegaprotocol/utils';
import {
  useThrottledDataProvider,
  useYesterday,
} from '@vegaprotocol/react-helpers';
import { PriceChangeCell } from '@vegaprotocol/datagrid';
import * as Schema from '@vegaprotocol/types';
import type { CandleClose } from '@vegaprotocol/types';
import { marketCandlesProvider } from '@vegaprotocol/market-list';
import { THROTTLE_UPDATE_TIME } from '../constants';

interface Props {
  marketId?: string;
  decimalPlaces?: number;
  initialValue?: string[];
  isHeader?: boolean;
  noUpdate?: boolean;
  inViewRoot?: RefObject<Element>;
}

export const Last24hPriceChange = ({
  marketId,
  decimalPlaces,
  initialValue,
  inViewRoot,
}: Props) => {
  const [ref, inView] = useInView({ root: inViewRoot?.current });
  const yesterday = useYesterday();
  const { data, error } = useThrottledDataProvider(
    {
      dataProvider: marketCandlesProvider,
      variables: {
        marketId: marketId || '',
        interval: Schema.Interval.INTERVAL_I1H,
        since: new Date(yesterday).toISOString(),
      },
      skip: !marketId || !inView,
    },
    THROTTLE_UPDATE_TIME
  );

  const candles =
    data
      ?.map((candle) => candle?.close)
      .filter((c): c is CandleClose => c !== null) || initialValue;

  if (error || !isNumeric(decimalPlaces)) {
    return <span ref={ref}>-</span>;
  }
  return (
    <PriceChangeCell
      candles={candles || []}
      decimalPlaces={decimalPlaces}
      ref={ref}
    />
  );
};
