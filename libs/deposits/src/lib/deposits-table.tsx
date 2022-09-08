import { AgGridColumn } from 'ag-grid-react';
import {
  t,
  addDecimalsFormatNumber,
  getDateTimeFormat,
  truncateByChars,
} from '@vegaprotocol/react-helpers';
import type {
  VegaICellRendererParams,
  VegaValueFormatterParams,
} from '@vegaprotocol/ui-toolkit';
import { AgGridDynamic as AgGrid, Link } from '@vegaprotocol/ui-toolkit';
import type { DepositFields } from './__generated__/DepositFields';
import { useEnvironment } from '@vegaprotocol/environment';
import { DepositStatusMapping } from '@vegaprotocol/types';

export interface DepositsTableProps {
  deposits: DepositFields[];
}

export const DepositsTable = ({ deposits }: DepositsTableProps) => {
  const { ETHERSCAN_URL } = useEnvironment();
  return (
    <AgGrid
      rowData={deposits}
      overlayNoRowsTemplate={t('No deposits')}
      defaultColDef={{ flex: 1, resizable: true }}
      style={{ width: '100%', height: '100%' }}
      suppressCellFocus={true}
    >
      <AgGridColumn headerName="Asset" field="asset.symbol" />
      <AgGridColumn
        headerName="Amount"
        field="amount"
        valueFormatter={({
          value,
          data,
        }: VegaValueFormatterParams<DepositFields, 'amount'>) => {
          return addDecimalsFormatNumber(value, data.asset.decimals);
        }}
      />
      <AgGridColumn
        headerName="Created at"
        field="createdTimestamp"
        valueFormatter={({
          value,
        }: VegaValueFormatterParams<DepositFields, 'createdTimestamp'>) => {
          return getDateTimeFormat().format(new Date(value));
        }}
      />
      <AgGridColumn
        headerName="Status"
        field="status"
        valueFormatter={({
          value,
        }: VegaValueFormatterParams<DepositFields, 'status'>) => {
          return DepositStatusMapping[value];
        }}
      />
      <AgGridColumn
        headerName="Tx hash"
        field="txHash"
        cellRenderer={({
          value,
        }: VegaICellRendererParams<DepositFields, 'txHash'>) => {
          if (!value) return '-';
          return (
            <Link
              title={t('View transaction on Etherscan')}
              href={`${ETHERSCAN_URL}/tx/${value}`}
              data-testid="etherscan-link"
              target="_blank"
            >
              {truncateByChars(value)}
            </Link>
          );
        }}
      />
    </AgGrid>
  );
};