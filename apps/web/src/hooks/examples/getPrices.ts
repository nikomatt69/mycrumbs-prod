import { ethers } from "ethers";
import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
import { ApiKeyCreds, BookParams, Chain, ClobClient, Side } from ".";

dotenvConfig({ path: resolve(__dirname, "../.env") });

async function main() {
    const wallet = new ethers.Wallet(`${process.env.PK}`);
    const chainId = parseInt(`${process.env.CHAIN_ID || Chain.POLYGON}`) as Chain;
    console.log(`Address: ${await wallet.getAddress()}, chainId: ${chainId}`);

    const host = process.env.CLOB_API_URL || "https://clob.polymarket.com";
    const creds: ApiKeyCreds = {
        key: `${process.env.CLOB_API_KEY}`,
        secret: `${process.env.CLOB_SECRET}`,
        passphrase: `${process.env.CLOB_PASS_PHRASE}`,
    };
    const clobClient = new ClobClient(host, chainId, wallet, creds);

    const YES = "71321045679252212594626385532706912750332728571942532289631379312455583992563";
    const NO = "52114319501245915516055106046884209969926127482827954674443846427813813222426";

    const prices = await clobClient.getPrices([
        { token_id: YES, side: Side.BUY },
        { token_id: YES, side: Side.SELL },
        { token_id: NO, side: Side.BUY },
        { token_id: NO, side: Side.SELL },
    ] as BookParams[]);

    console.log(prices);
}

main();