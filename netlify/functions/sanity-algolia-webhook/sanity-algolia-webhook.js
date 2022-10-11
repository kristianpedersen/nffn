const AlgoliaProjectID = 'C26QC41PWH';
const AlgoliaApiKey = "e23b64dadd4c26f8678c15a2593521fa";

import { createNullLogger, LogLevelEnum } from '@algolia/logger-common';
import { createConsoleLogger } from '@algolia/logger-console';
import algoliasearch from 'algoliasearch';

const client = algoliasearch(AlgoliaProjectID, AlgoliaApiKey, {
  logger: createConsoleLogger(LogLevelEnum.Debug)
});

const index = client.initIndex("Sanity-Algolia");

exports.handler = async event => {
  try {
    const { created, deleted, updated } = event.body; // These contain either [null] or [Algolia record ID(s)]

    const savedObjects = await index.saveObjects(created, { autoGenerateObjectIDIfNotExist: true });
    const deletedObjects = await index.deleteObjects(deleted);
    const updatedObjects = await index.partialUpdateObjects(updated, { createIfNotExists: false });

    return {
      statusCode: 200,
      body: `Action: ${{ created, deleted, updated }}`
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    };
  }


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