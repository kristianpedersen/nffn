import { LogLevelEnum } from '@algolia/logger-common';
import { createConsoleLogger } from '@algolia/logger-console';
import algoliasearch from 'algoliasearch';
import fetch from "node-fetch";

export const handler = async event => {
  console.log({ event });
  const AlgoliaProjectID = 'C26QC41PWH';
  const AlgoliaApiKey = "e23b64dadd4c26f8678c15a2593521fa";
  const client = algoliasearch(AlgoliaProjectID, AlgoliaApiKey, {
    logger: createConsoleLogger(LogLevelEnum.Debug)
  });

  const sanityProjectID = "sukats6f";
  const index = client.initIndex("Sanity-Algolia");

  try {
    const {
      created,
      deleted,
      updated,
      all
    } = JSON.parse(event.body).ids;

    // For example:
    /* {
          created: [null],
          deleted: [sanityDocumentID(s)],
          updated: [null],
          all: [sanityDocumentID(s)]
        }
    */

    // If the webhook was triggered, we can (probably?) assume that all[0] contains a valid Sanity document ID.
    // Since these are arrays, they could probably contain several IDs in certain cases, but when?
    const sanityDocumentID = all[0];

    console.log(all[0], created[0], updated[0], deleted[0], { event })

    let obj = "";

    if (created[0] || updated[0]) {
      const sanityURL = `https://${sanityProjectID}.api.sanity.io/v2021-06-07/data/query/test?query=*[_id=="${sanityDocumentID}"]{content}`;
      const document = await fetch(sanityURL);
      const response = await document.json();

      console.log({ response });

      const fetchedDataFromSanity = response.result[0].content[0];

      obj = await index.saveObject(
        { ...fetchedDataFromSanity, objectID: sanityDocumentID },
        { autoGenerateObjectIDIfNotExist: true }
      );
    } else if (deleted[0]) {
      obj = index.deleteObject(sanityDocumentID);
      console.log({ deleted: true, obj });
    }

    return {
      statusCode: 200,
      body: JSON.stringify(obj)
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    };
  }
};