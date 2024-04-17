import { getNetworkEndpoints, Network } from '@injectivelabs/networks';
import WebSocket from 'ws';

async function main() {
  const endpoints = getNetworkEndpoints(Network.Testnet);
  const ws = new WebSocket(
    'wss://testnet.sentry.tm.injective.network:443/websocket'
  );
  ws.on('open', () => {
    ws.send(
      JSON.stringify({
        jsonrpc: '2.0',
        method: 'subscribe',
        params: {
          query:
            "tm.event='Tx' AND transfer.recipient='inj1xh928v0zwy54nv3d9m9splk0nu9jfnugg8pmkk'",
        },
        id: 1,
      })
    );
  });
  ws.on('message', async (data) => {
    const parsedData = JSON.parse(data.toString());
    const parsedLog = JSON.parse(
      parsedData?.result?.data?.value?.TxResult?.result?.log || null
    );
    if (!parsedLog) {
      return;
    }
    const events = parsedLog[0]?.events;
    events.forEach((event) => {
      if (event.type == 'transfer') {
        console.log(
          `Received ${event.attributes[2].value} coin from ${event.attributes[1].value} to ${event.attributes[0].value}`
        );
      }
    });
  });
}

main().then().catch(console.error);
