process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const https = require("https");

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});
const host = "https://localhost:9200";
const username = "elastic";
const password = "t=VH72X-k7utw0RJHE2o";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const createIndex = async (indexName) => {
  const options = {
    method: "PUT",
    agent: httpsAgent,
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Basic ${btoa(`${username}:${password}`)}`,
    },
    body: JSON.stringify({
      settings: {
        number_of_shards: 1,
        number_of_replicas: 1,
      },
      mappings: {
        properties: {
          username: { type: "text" },
          date: { type: "date" },
          message: { type: "text" },
        },
      },
    }),
  };
  const response = await fetch(`${host}/${indexName}`, options);

  console.log("Index created:", await response.json());
}

const deleteIndex = async (indexName) => {
  const response = await fetch(`${host}/${indexName}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Basic ${btoa(`${username}:${password}`)}`,
    }
  });
  console.log("Index deleted:", await response.json());
}

const storeDocument = async (indexName, document) => {
  const options = {
    method: "POST",
    agent: httpsAgent,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${btoa(`${username}:${password}`)}`,
    },
    body: JSON.stringify(document),
  };
  const response = await fetch(`${host}/${indexName}/_doc`, options);
  console.log("Document stored:", await response.json());
}

const searchDocument = async (indexName, query) => {
  const options = {
    method: "GET",
    agent: httpsAgent,
    headers: {
      "Authorization": `Basic ${btoa(`${username}:${password}`)}`,
    },
    query: JSON.stringify({
      query: {
        match: query,
      },
    }),
  };
  const response = await fetch(`${host}/${indexName}/_search`, options);
  console.log("Search results:", (await response.json()).hits.hits);
}

const run = async () => {
  const indexName = "tweets";
  await createIndex(indexName);
  await storeDocument(indexName, {
    username: "john_doe",
    date: new Date().toISOString(),
    message: "Hello World!",
  });
  await sleep(1000);
  await searchDocument(indexName, { username: "john_doe" });
  await deleteIndex(indexName);
}

run();