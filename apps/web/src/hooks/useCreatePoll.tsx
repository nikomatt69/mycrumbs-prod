
import getAuthApiHeaders from '@components/Shared/Oembed/Portal/getAuthApiHeaders main';
import { HEY_API_URL } from '@lensshare/data/constants';
import axios from 'axios';
import { usePublicationStore } from 'src/store/non-persisted/usePublicationStore';

type CreatePollResponse = string;
const useCreatePoll = () => {
  const {pollConfig} = usePublicationStore();
  // TODO: use useCallback
  const createPoll = async (): Promise<CreatePollResponse> => {
    const response = await axios.post(
      `/api/polls/snapshot/create`,
      {
        length: pollConfig.length,
        options: pollConfig.options
      },
      { headers: getAuthApiHeaders() }
    );
    return response.data.poll.id;
  };
  return createPoll;
};
export default useCreatePoll;