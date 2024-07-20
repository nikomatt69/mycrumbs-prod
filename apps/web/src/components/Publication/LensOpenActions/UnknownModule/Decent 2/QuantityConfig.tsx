import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import stopEventPropagation from "@lensshare/lib/stopEventPropagation";
import { useNftOpenActionStore } from "./FeedEmbed";
import { FC } from "react";

const QuantityConfig: FC = () => {
  const { selectedQuantity, setSelectedQuantity } = useNftOpenActionStore();

  return (
    <div className="flex items-center justify-between border-y border-zinc-200 px-5 py-4">
      <p className="ld-text-gray-500">Quantity</p>
      <div className="flex items-center space-x-4">
        <button
          className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 disabled:opacity-50"
          disabled={selectedQuantity === 1}
          onClick={(e) => {
            stopEventPropagation(e);
            setSelectedQuantity(selectedQuantity - 1);
          }}
        >
          <MinusIcon className="h-3 w-3 stroke-black text-gray-600" />
        </button>
        <span className="h-6 w-6 text-center">{selectedQuantity}</span>
        <button
          className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 disabled:opacity-40"
          onClick={(e) => {
            stopEventPropagation(e);
            setSelectedQuantity(selectedQuantity + 1);
          }}
        >
          <PlusIcon className="h-3 w-3 stroke-black text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default QuantityConfig;