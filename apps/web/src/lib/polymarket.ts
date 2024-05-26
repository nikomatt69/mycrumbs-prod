




export const getMarket = async (conditionId: string) => {
  const response = await fetch(`${conditionId}`,{
    mode: 'no-cors'
  });
  const data = await response.json();
  return data;
};

export const createMarketOrder = async (tokenId: string, amount: number) => {
  const order = {
    tokenId,
    amount,
  };
  return order;
};

export const placeOrder = async (order: any) => {
  const response = await fetch('https://clob.polymarket.com/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(order),
  });
  const data = await response.json();
  return data;
};