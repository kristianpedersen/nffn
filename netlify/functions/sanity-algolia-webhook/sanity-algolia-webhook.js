const AlgoliaProjectID = 'C26QC41PWH';
const AlgoliaApiKey = "e23b64dadd4c26f8678c15a2593521fa";

import { createNullLogger, LogLevelEnum } from '@algolia/logger-common';
import { createConsoleLogger } from '@algolia/logger-console';
import algoliasearch from 'algoliasearch';

const client = algoliasearch(AlgoliaProjectID, AlgoliaApiKey, {
  logger: createConsoleLogger(LogLevelEnum.Debug)
});

const index = client.initIndex("Sanity-Algolia");

const handler = async event => {
  try {
    const { created, deleted, updated } = JSON.parse(event.body).ids; // These contain either [null] or [Algolia record ID(s)]

    console.log({ created, deleted, updated })

    // index.saveObjects(created, { autoGenerateObjectIDIfNotExist: true })
    //   .then(bla => console.log(bla))

    // const deletedObjects = index.deleteObjects(deleted);
    // console.log({ deletedObjects });

    const updatedObjects = await index.partialUpdateObjects(updated, { createIfNotExists: false });
    console.log({ updatedObjects });

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
};

module.exports = { handler }