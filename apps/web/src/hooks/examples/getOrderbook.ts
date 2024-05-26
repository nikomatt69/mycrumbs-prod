import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
import { Chain, ClobClient } from ".";

dotenvConfig({ path: resolve(__dirname, "../.env") });

async function main() {
    const host = process.env.CLOB_API_URL || "https://clob.polymarket.com";
    const chainId = parseInt(`${process.env.CHAIN_ID || Chain.POLYGON}`) as Chain;
    const clobClient = new ClobClient(host, chainId);
    const YES = "71321045679252212594626385532706912750332728571942532289631379312455583992563";

    const orderbook = await clobClient.getOrderBook(YES);
    console.log("orderbook", orderbook);

    const hash = clobClient.getOrderBookHash(orderbook);
    console.log("orderbook hash", hash);
}

main();
