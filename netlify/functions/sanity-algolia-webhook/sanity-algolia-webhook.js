const AlgoliaProjectID = 'C26QC41PWH';
const AlgoliaApiKey = "e23b64dadd4c26f8678c15a2593521fa";

import { createNullLogger, LogLevelEnum } from '@algolia/logger-common';
import { createConsoleLogger } from '@algolia/logger-console';
import algoliasearch from 'algoliasearch';

const client = algoliasearch(AlgoliaProjectID, AlgoliaApiKey, {
  logger: createConsoleLogger(LogLevelEnum.Debug)
});

const index = client.initIndex("Sanity-Algolia");

const handler = (event) => {
  // 1. Hent PortableText-objektet fra webhook-request (event.body)
  // 2. Sjekk om "create/update/delete" er angitt i request body
  // 3. Sjekk om ID-ene allerede finnes i Algolia-indeksen
};

function search({ queryString, requestOptions }) {
  index.search(queryString, requestOptions)
    .then(({ hits }) => {
      console.log(hits);
    });
}

function updateIndex() {
  console.log("")
}