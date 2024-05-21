import { HttpLink } from '@apollo/client';
import { API_URL, APP_NAME } from '@lensshare/data/constants';
import { setContext } from '@apollo/client/link/context';

const httpLink = new HttpLink({
  uri: API_URL,
  fetchOptions: 'no-cors',
  fetch,
  headers: {
    'x-requested-from': APP_NAME.toLowerCase()
  },
});


const csrfLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      'x-apollo-operation-name': 'your-operation-name', // Example value
      'apollo-require-preflight': 'true', // Example value
    }
  };
});

export default httpLink = csrfLink.concat(httpLinkWithCSRF);


