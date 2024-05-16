import type { OptimisticTransaction } from '@lensshare/types/misc';
import type { FC } from 'react';

import { XMarkIcon } from '@heroicons/react/24/outline';

import { Tooltip } from '@lensshare/ui';
import { useTransactionStore } from 'src/store/persisted/useTransactionStore';
import { OptmisticPublicationType } from '@lensshare/types/enums';

interface TransactionProps {
  transaction: OptimisticTransaction;
}

const Transaction: FC<TransactionProps> = ({ transaction }) => {
  const { removeTransaction } = useTransactionStore();

  return (
    <div className="flex items-center justify-between">
      <Tooltip content={transaction.txId || transaction.txHash} placement="top">
        {transaction.type === OptmisticPublicationType.Comment ? (
          <div className="text-sm">
            {transaction.type} on {transaction.commentOn}
          </div>
        )  : transaction.type === OptmisticPublicationType.Post ||
          transaction.type === OptmisticPublicationType.Quote ? (
          <div className="text-sm">{transaction.type}</div>
        ) : null}
      </Tooltip>
      <div className="flex items-center space-x-2">
        <Tooltip content="Indexing" placement="top">
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-200">
            <div className="animate-shimmer h-2 w-2 rounded-full bg-gray-500" />
          </div>
        </Tooltip>
        <button
          onClick={() =>
            removeTransaction(
              (transaction.txId || transaction.txHash) as string
            )
          }
        >
          <XMarkIcon className="h-5 w-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export default Transaction;
