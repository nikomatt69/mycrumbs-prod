const onBrowserPushWorkerMessage = (event: MessageEvent) => {
  const { data } = event;
  const headers = new Headers({
    
    'Access-Control-Allow-Origin': '*'
  });
  postMessage({ data, headers });
};

addEventListener('message', onBrowserPushWorkerMessage);