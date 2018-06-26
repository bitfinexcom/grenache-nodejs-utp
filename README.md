# [Grenache](https://github.com/bitfinexcom/grenache) Node.JS UTP implementation

<img src="logo.png" width="15%" />

Grenache is a micro-framework for connecting microservices. Its simple and optimized for performance.

Internally, Grenache uses Distributed Hash Tables (DHT, known from Bittorrent) for Peer to Peer connections. You can find more details how Grenche internally works at the [Main Project Homepage](https://github.com/bitfinexcom/grenache)

 - [Setup](#setup)
 - [Examples](#examples)
 - [API](#api)

## Setup

### Install

```
npm install --save grenache-nodejs-utp
```

### API

[/examples/](/examples/)

### Other Requirements

Install `Grenache Grape`: https://github.com/bitfinexcom/grenache-grape:

```bash
npm i -g grenache-grape
```

```
// Start 2 Grapes
grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'
```


### Testing: with just one party behin a NAT

In a lot of scenarios just one party is behind a NAT and the other is available with a public port and IP.

#### Instructions

Run a Grape instance on the public server, lets say the server has the IP `157.81.109.241`:

```
DEBUG=* grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
```

Then start a Grape instance locally on your machine, behind a NAT, and connect it to the other Grape:

```
DEBUG=* grape --dp 20002 --aph 30001 --bn '157.81.109.241:20001'
```

You should see both Grapes connecting to each other.

Start the party which runs on the public server. It will announce itself as `fibonacci_consumer` on the network:

```
node examples/punch_simple_servers/rpc_server_public.js
```

Start `rpc_server_behind_nat.js` on your local machine behind the router now. It looks up possible consumers and sends a UDP packet to the consumer. This establishes a temporary ad-hoc routing for the service running in the home network.

When the packet arrives at the public server, it will emit a `punch` event. The public server handles the event and gets the IP/port from the ad-hoc routing. It then kicks of the request for calculation.


```
node examples/punch_simple_servers/rpc_server_behind_nat.js
```

### Testing: with broker

In case both services are behin a NAT, we have to make use of a shared and common broker. This can be a normal server which is reachable by both parties by an address and port kown from all parties.

#### Instructions

Run a Grape instance on a server, lets say the server has the IP `157.81.109.241`:

```
DEBUG=* grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
```


Then start a Grape instance locally on your machine, behind a NAT, and connect it to the other Grape:

```
DEBUG=* grape --dp 20002 --aph 30001 --bn '157.81.109.241:20001'
```

On your remote server, start the broker:

```
node examples/nat_w_broker/broker.js
```

On your local machine behind the NAT, start the service:

```
node examples/nat_w_broker/nat_server.js
```

From your external server, you should be able to connect to the machine behind the NAT now:

```
node examples/nat_w_broker/rpc_client.js
```
