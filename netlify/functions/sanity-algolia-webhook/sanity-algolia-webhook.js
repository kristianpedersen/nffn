const AlgoliaProjectID = 'C26QC41PWH';
const AlgoliaApiKey = "e23b64dadd4c26f8678c15a2593521fa";

const { LogLevelEnum } = require('@algolia/logger-common');
const { createConsoleLogger } = require('@algolia/logger-console');
const algoliasearch = require('algoliasearch');

// import fetch from 'node-fetch';

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
    } = JSON.parse(event.body).ids; // These contain either [null] or an array of Sanity document IDs

    const sanityURL = `https://${sanityProjectID}.api.sanity.io/v2021-06-07/data/query/test?query=*[_id=="${all[0]}"]{content}`;
    console.log({ sanityURL });

    const document = await fetch(sanityURL);
    const json = await document.json();
    console.log({ json });

    const action = [created, deleted, updated].find(ID => Boolean(ID));
    console.log({ action });

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