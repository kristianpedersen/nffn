const AlgoliaProjectID = 'C26QC41PWH';
const AlgoliaApiKey = "e23b64dadd4c26f8678c15a2593521fa";

import { LogLevelEnum } from '@algolia/logger-common';
import { createConsoleLogger } from '@algolia/logger-console';
import algoliasearch from 'algoliasearch';

const client = algoliasearch(AlgoliaProjectID, AlgoliaApiKey, {
  logger: createConsoleLogger(LogLevelEnum.Debug)
});
const sanityProjectID = "sukats6f";
const index = client.initIndex("Sanity-Algolia");

const handler = async event => {
  try {
    const {
      created,
      deleted,
      updated,
      all
    } = JSON.parse(event.body).ids; // These contain either [null] or Sanity document IDs
    const allSanityDocumentIDs = all;

    const sanityURLs = all.map(documentID => {
      return `https://${sanityProjectID}.api.sanity.io/v2021-06-07/data/query/test?query=*[_id==${documentID}]{content}`;
    });
    console.log({ sanityURLs });

    const documents = await Promise.all(
      sanityURLs.map(url => {
        return fetch(url)
          .then(res => res.json())
      })
    );
    console.log({ documents });

    // const createdOrUpdated = await index.saveObjects(updated || created || [], { autoGenerateObjectIDIfNotExist: true });
    // console.log({createdOrUpdated});

    // const deletedObjects = index.deleteObjects(deleted || []);
    // console.log({ deletedObjects });

    return {
      statusCode: 200,
      body: `Action: ${{ created, deleted, updated }}`
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    };
  }
};

module.exports = { handler }