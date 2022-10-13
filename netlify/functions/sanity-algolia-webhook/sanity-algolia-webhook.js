import { LogLevelEnum } from '@algolia/logger-common';
import { createConsoleLogger } from '@algolia/logger-console';
import algoliasearch from 'algoliasearch';
import fetch from "node-fetch";

const AlgoliaProjectID = 'C26QC41PWH';
const AlgoliaApiKey = "e23b64dadd4c26f8678c15a2593521fa"; // TODO: Legg et annet sted :)
const client = algoliasearch(AlgoliaProjectID, AlgoliaApiKey, {
  logger: createConsoleLogger(LogLevelEnum.Debug)
});

const sanityProjectID = "sukats6f";
const index = client.initIndex("Sanity-Algolia");

export const handler = async event => {
  try {
    const { created, deleted, updated, all } = JSON.parse(event.body).ids; // All four items contain either [null] or [sanityDocumentID]

    // all[0] should always contain a SanityDocumentID associated with create/update/delete.
    // Do these arrays ever contain more than one item?
    const sanityDocumentID = all[0];

    if (deleted[0]) {
      await index.deleteObject(sanityDocumentID);
    } else if (updated[0] || created[0]) {
      const sanityURL = `https://${sanityProjectID}.api.sanity.io/v2021-06-07/data/query/test?query=*[_id=="${sanityDocumentID}"]{content}`;
      const response = await fetch(sanityURL);
      const data = await response.json();
      const fetchedDataFromSanity = data?.result[0]?.content[0];

      await index.saveObject({
        ...fetchedDataFromSanity,
        objectID: sanityDocumentID
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify(event)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    };
  }
};