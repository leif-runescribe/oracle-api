const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");
const { PriceServiceConnection } = require("@pythnetwork/price-service-client");
const { Client } = require("@bandprotocol/bandchain.js");
// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT;

// Define a basic route
app.get("/", (req, res) => {
  res.send("agrigato backend");
});
app.get("/fetch", async (req, res) => {
  try {
    const url =
      "https://hermes.pyth.network/v2/price_feeds?query=&asset_type=crypto";
    const resp = await axios.get(url);

    const ids = resp.data.map((crypto) => crypto);
    res.send(ids);
    console.log(ids);
  } catch (error) {
    console.error(error); // Use console.error for logging errors
    res.status(500).send("Error fetching data");
  }
});

app.get("/pyth", async (req, res) => {
    try {
      const { ids } = req.query;
      if (!ids) {
        return res.status(400).json({ error: 'Missing ids parameter' });
      }
  
      const priceIds = ids.split(',').map(id => id.trim());
  
      const connection = new PriceServiceConnection("https://hermes.pyth.network");
      const currentPrices = await connection.getLatestPriceFeeds(priceIds);
  
      res.json(currentPrices);
      console.log("new run--------------------------------")
      console.log("Fetched prices:", currentPrices);
    } catch (error) {
      console.error("Error fetching prices:", error);
      res.status(500).json({ error: 'Failed to fetch prices' });
    }
  });

  app.get("/band/:base/:quote", async (req, res) => {
    try {
      const endpoint = "https://laozi-testnet6.bandchain.org/grpc-web";
      const client = new Client(endpoint);
  
      const minCount = 3;
      const askCount = 4;
      const base = req.params.base;
      const quote = req.params.quote;
  
      // This example demonstrates how to query price data from
      // Band's standard dataset
      async function exampleGetReferenceData(base, quote) {
        const rate = await client.getReferenceData(
          [`${base}/${quote}`],
          minCount,
          askCount
        );
        return rate;
      }
  
      try {
        const rate = await exampleGetReferenceData(base, quote);
        console.log(rate);
        res.send(rate);
      } catch (error) {
        console.error("Error fetching reference data:", error);
        res.status(500).send({ error: "Error fetching reference data" });
      }
    } catch (error) {
      console.error("Error setting up the client:", error);
      res.status(500).send({ error: "Error setting up the client" });
    }
  });
// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
