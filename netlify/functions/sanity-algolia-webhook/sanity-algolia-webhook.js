const algoliasearch = require("algoliasearch");

const client = algoliasearch(
  'C26QC41PWH',
  "e23b64dadd4c26f8678c15a2593521fa"
);

const index = client.initIndex("Sanity-Algolia");
const articlesJSON = require("./articles.json");

index.saveObjects(articlesJSON, {
  autoGenerateObjectIDIfNotExist: true
}).then(({ objectIDs }) => {
  console.log(objectIDs);
});

const handler = event => {
  return JSON.stringify(event);
}