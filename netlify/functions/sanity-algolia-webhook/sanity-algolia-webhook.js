import { LogLevelEnum } from '@algolia/logger-common';
import { createConsoleLogger } from '@algolia/logger-console';
import algoliasearch from 'algoliasearch';
import fetch from "node-fetch";

export const handler = async event => {
  const AlgoliaProjectID = 'C26QC41PWH';
  const AlgoliaApiKey = "e23b64dadd4c26f8678c15a2593521fa";
  const client = algoliasearch(AlgoliaProjectID, AlgoliaApiKey, {
    logger: createConsoleLogger(LogLevelEnum.Debug)
  });

  const sanityProjectID = "sukats6f";
  const index = client.initIndex("Sanity-Algolia");

  try {
    // These contain either [null] or an array of Sanity document IDs:
    const { created, deleted, updated, all } = JSON.parse(event.body).ids;

    let obj = "";

    if (created || updated) {
      // If the webhook was triggered, we can (probably?) assume that all[0] contains a valid Sanity document ID.
      const sanityURL = `https://${sanityProjectID}.api.sanity.io/v2021-06-07/data/query/test?query=*[_id=="${all[0]}"]{content}`;
      const document = await fetch(sanityURL);
      const response = await document.json();
      console.log({ response });
      const fetchedDataFromSanity = response.result[0].content[0];

      console.log({ data: JSON.stringify(fetchedDataFromSanity) });
      obj = await index.saveObjects(fetchedDataFromSanity, { autoGenerateObjectIDIfNotExist: true });
      console.log({ saved: true, obj });

    } else if (deleted) {
      obj = index.deleteObjects(data);
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