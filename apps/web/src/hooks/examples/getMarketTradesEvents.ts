import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
import { Chain, ClobClient } from ".";

dotenvConfig({ path: resolve(__dirname, "../.env") });

async function main() {
    const host = process.env.CLOB_API_URL || "https://clob.polymarket.com";
    const chainId = parseInt(`${process.env.CHAIN_ID || Chain.POLYGON}`) as Chain;
    const clobClient = new ClobClient(host, chainId);

    console.log("events", await clobClient.getMarketTradesEvents("condition_id"));
}

main();
