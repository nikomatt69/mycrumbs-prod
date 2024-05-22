import { DefaultContext, GraphQLRequest, HttpLink } from '@apollo/client';
import { API_URL, APP_NAME } from '@lensshare/data/constants';
import { setContext } from '@apollo/client/link/context';


const httpLinkWithCSRF = new HttpLink({
  uri: API_URL,
  fetchOptions: 'no-cors',
  fetch,
  headers: {
    'x-requested-from': APP_NAME.toLowerCase()
  },
});

const csrfLink = setContext((operation: GraphQLRequest<Record<string, any>>, { headers = {} }: DefaultContext): { headers: any } => ({
  headers: {
    ...headers,
    'x-apollo-operation-name': operation.operationName || '',
    'apollo-require-preflight': 'true',
  }
}));

const httpLink = csrfLink.concat( httpLinkWithCSRF);

export default httpLink;

