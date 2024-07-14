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




  app.get('/pyth/:id1', async (req, res) => {
      const Id = 
      req.params.id1 
      
  
    try {
      const connection = new PriceServiceConnection("https://hermes.pyth.network");
      
      const x1 = await connection.getLatestPriceFeeds([Id])
      
      const {conf, expo, price} = x1[0].price
      const { conf: conf1, expo: expo1, price: price1 } = x1[0].emaPrice;
      const p = parseFloat(price)*Math.pow(10, expo)
      const p1 = parseFloat(price1)*Math.pow(10, expo1)
      console.log(p,p1)
      
      res.send({p,p1})
      
    } catch (error) {
      console.error('Error fetching price feeds:', error);
      res.status(500).json({ error: 'Failed to fetch price feeds' });
    }
  });

  app.get("/band/:crypto1/:crypto2", async (req, res) => {
    try {
      const endpoint = "https://laozi-testnet6.bandchain.org/grpc-web";
      const client = new Client(endpoint);
  
      const minCount = 3;
      const askCount = 4;
      const c1 = req.params.crypto1;
      const c2 = req.params.crypto2;
      async function exampleGetReferenceData(c1,c2) {
        const rate = await client.getReferenceData(
          [`${c1}/${c2}`],
          minCount,
          askCount
        );
        return rate;
      } 
      try {
        const rate = await exampleGetReferenceData(c1, c2);
        
        
        const {rate: r} = rate[0] 
        console.log(r);
        res.send({r});
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
