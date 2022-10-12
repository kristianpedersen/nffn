import { LogLevelEnum } from '@algolia/logger-common';
import { createConsoleLogger } from '@algolia/logger-console';
import algoliasearch from 'algoliasearch';
import fetch from "node-fetch";

const PROD = true;

export const handler = async event => {
  try {
    const AlgoliaProjectID = 'C26QC41PWH';
    const AlgoliaApiKey = "e23b64dadd4c26f8678c15a2593521fa";
    const client = algoliasearch(AlgoliaProjectID, AlgoliaApiKey, {
      logger: createConsoleLogger(LogLevelEnum.Debug)
    });

    const sanityProjectID = "sukats6f";
    const index = client.initIndex("Sanity-Algolia");

    // These contain either [null] or an array of Sanity document IDs:
    const { created, deleted, updated, all } = PROD
      ? JSON.parse(event.body).ids
      : {
        created: [null],
        deleted: [null],
        updated: ["43cec318-21ad-4e49-a6a9-75a8fa1f4ad6"],
        all: ["43cec318-21ad-4e49-a6a9-75a8fa1f4ad6"]
      };

    // If the webhook was triggered, we can (probably?) assume that all[0] contains a valid Sanity document ID.
    const sanityURL = `https://${sanityProjectID}.api.sanity.io/v2021-06-07/data/query/test?query=*[_id=="${all[0]}"]{content}`;

    const document = await fetch(sanityURL);
    const response = await document.json();
    const data = response.result[0].content;
    console.log({ data })
    // const createdOrUpdated = await index.saveObjects(updated || created || [], { autoGenerateObjectIDIfNotExist: true });
    // console.log({createdOrUpdated});

    // const deletedObjects = index.deleteObjects(deleted || []);
    // console.log({ deletedObjects });

    return {
      statusCode: 200,
      body: JSON.stringify(response.result[0])
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    };
  }
};

PROD
  ? console.log("Hei fra prod!")
  : handler()