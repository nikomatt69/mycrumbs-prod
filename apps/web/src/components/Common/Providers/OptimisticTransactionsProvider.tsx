import type { FC } from 'react';

import {
  LensTransactionStatusType,
  useLensTransactionStatusQuery
} from '@lensshare/lens';
import { useTransactionStore } from 'src/store/persisted/useTransactionStore';
import type { OptimisticTransaction } from '@lensshare/types/misc';
import { OptmisticPublicationType } from '@lensshare/types/enums';

const Transaction = ({
  transaction
}: {
  transaction: OptimisticTransaction;
}) => {
  const { removeTransaction, setIndexedPostHash } = useTransactionStore();

  useLensTransactionStatusQuery({
    fetchPolicy: 'no-cache',
    notifyOnNetworkStatusChange: true,
    onCompleted: ({ lensTransactionStatus }) => {
      if (
        lensTransactionStatus?.status === LensTransactionStatusType.Failed ||
        lensTransactionStatus?.status === LensTransactionStatusType.Complete
      ) {
        // Trigger Profile feed refetch
        if (
          transaction.type === OptmisticPublicationType.Post &&
          lensTransactionStatus.txHash
        ) {
          setIndexedPostHash(lensTransactionStatus.txHash);
        }

        return removeTransaction(
          (transaction.txId || transaction.txHash) as string
        );
      }
    },
    pollInterval: 3000,
    variables: {
      request: {
        ...(transaction.txId && { forTxId: transaction.txId }),
        ...(transaction.txHash && { forTxHash: transaction.txHash })
      }
    }
  });

  return null;
};

const OptimisticTransactionsProvider: FC = () => {
  const { txnQueue } = useTransactionStore();

  console.log(txnQueue);

  return txnQueue.map((txn) => (
    <Transaction key={txn.txId || txn.txHash} transaction={txn} />
  ));
};

export default OptimisticTransactionsProvider;