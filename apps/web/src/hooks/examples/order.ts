import { ethers } from "ethers";
import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
import { ApiKeyCreds, Chain, ClobClient, Side } from ".";

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

    // Create a buy order for 100 YES for 0.50c
    const YES = "71321045679252212594626385532706912750332728571942532289631379312455583992563";
    const order = await clobClient.createOrder(
        {
            tokenID: YES,
            price: 0.5,
            side: Side.BUY,
            size: 100,
            feeRateBps: 0,
        },
        { tickSize: "0.01" },
    );
    console.log("Created Order", order);

    // Send it to the server
    const resp = await clobClient.postOrder(order);
    console.log(resp);
}

main();