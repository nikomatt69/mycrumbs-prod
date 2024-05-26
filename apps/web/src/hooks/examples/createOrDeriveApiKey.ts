import { ethers } from "ethers";
import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
import { Chain, ClobClient } from ".";

dotenvConfig({ path: resolve(__dirname, "../.env") });

async function main() {
    const wallet = new ethers.Wallet(`${process.env.PK}`);
    const chainId = parseInt(`${process.env.CHAIN_ID || Chain.POLYGON}`) as Chain;
    console.log(`Address: ${await wallet.getAddress()}, chainId: ${chainId}`);

    const host = process.env.CLOB_API_URL || "https://clob.polymarket.com";
    const clobClient = new ClobClient(host, chainId, wallet);

    console.log(`Response: `);
    const resp = await clobClient.createOrDeriveApiKey();
    console.log(resp);
    console.log(`Complete!`);
}

main();
