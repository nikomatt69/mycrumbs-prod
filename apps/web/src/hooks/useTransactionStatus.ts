import { LensTransactionStatusType, useLensTransactionStatusQuery } from "@lensshare/lens";
import { useState } from "react";
import { Address } from "viem";

interface TransactionStatusProps {
  reload?: boolean;
  txHash?: Address;
  txId?: string;
}

const useTransactionStatus = ({
  reload,
  txHash,
  txId
}: TransactionStatusProps) => {
  const [hide, setHide] = useState(false);
  const [pollInterval, setPollInterval] = useState(500);

  const shouldSkip = !txHash && !txId;

  const { data, loading } = useLensTransactionStatusQuery({
    notifyOnNetworkStatusChange: true,
    onCompleted: ({ lensTransactionStatus }) => {
      if (
        lensTransactionStatus?.status === LensTransactionStatusType.Complete
      ) {
        setPollInterval(0);
        if (reload) {
          location.reload();
        }
        setTimeout(() => {
          setHide(true);
        }, 5000);
      }
    },
    pollInterval,
    skip: shouldSkip,
    variables: {
      request: {
        ...(txHash && { forTxHash: txHash }),
        ...(txId && { forTxId: txId })
      }
    }
  });

  return { data, hide, loading };
};

export default useTransactionStatus;