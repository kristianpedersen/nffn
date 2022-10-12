const AlgoliaProjectID = 'C26QC41PWH';
const AlgoliaApiKey = "e23b64dadd4c26f8678c15a2593521fa";

import { LogLevelEnum } from '@algolia/logger-common';
import { createConsoleLogger } from '@algolia/logger-console';
import algoliasearch from 'algoliasearch';

const client = algoliasearch(AlgoliaProjectID, AlgoliaApiKey, {
  logger: createConsoleLogger(LogLevelEnum.Debug)
});

const index = client.initIndex("Sanity-Algolia");

const handler = async event => {
  try {
    console.log({ event });
    const {
      created,
      deleted,
      updated,
      all
    } = JSON.parse(event.body).ids; // These contain either [null] or Sanity document IDs

    const sanityDocumentURLs = all.map(documentID => {
      return `https://${sanityProjectID}.api.sanity.io/v2021-06-07/data/query/test?query=*[_id==${documentID}]{content}`;
    });

    console.log({ sanityDocumentURLs })

    const fetchSanityDocuments = async () => {
      try {
        return await Promise.all(
          sanityDocumentURLs.map(url => fetch(url).then(res => res.json()))
        );
      } catch (error) {
        console.error({ error });
      }
    }

    // Fetch Sanity documents by ID
    const sanityDocuments = fetchSanityDocuments();

    console.log({ sanityDocuments })

    // const createdOrUpdated = await index.saveObjects(updated || created || [], { autoGenerateObjectIDIfNotExist: true });
    // console.log({createdOrUpdated});

    // const deletedObjects = index.deleteObjects(deleted || []);
    // console.log({ deletedObjects });

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