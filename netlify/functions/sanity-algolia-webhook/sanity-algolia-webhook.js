import { LogLevelEnum } from "@algolia/logger-common";
import { createConsoleLogger } from "@algolia/logger-console";
import { portableTextToPlainText } from "./portableTextToPlainText";

import algoliasearch from "algoliasearch";
import fetch from "node-fetch";

const AlgoliaProjectID = "C26QC41PWH";
const AlgoliaApiKey = "e23b64dadd4c26f8678c15a2593521fa"; // TODO: Legg et annet sted :)
const client = algoliasearch(AlgoliaProjectID, AlgoliaApiKey, {
  logger: createConsoleLogger(LogLevelEnum.Debug),
});

const sanityProjectID = "sukats6f";
const index = client.initIndex("searchResults");

export const handler = async (event) => {
  try {
    // All four items contain either [null] or [sanityDocumentID]
    console.log("-".repeat(80));
    console.log(Object.keys(JSON.parse(event.body)));
    console.log(JSON.parse(event.body));
    const { created, deleted, updated, all } = JSON.parse(event.body).ids;

    // all[0] should always contain a SanityDocumentID associated with create/update/delete.
    // Do these arrays ever contain more than one item?
    const sanityDocumentID = all[0];

    if (deleted[0]) {
      await index.deleteObject(sanityDocumentID);
    } else if (updated[0] || created[0]) {
      // https://www.sanity.io/organizations/o5p1E5nlg/project/sukats6f/api/webhooks/YpndWrWXiZr0qxDY
      const projection = `{
        "ids": {
          "created": [
            select(before() == null && after() != null => _id)
          ],
          "deleted": [
            select(before() != null && after() == null => _id)
          ],
          "updated": [
            select(before() != null && after() != null => _id)
          ]
        },
        title,
        description,
        content,
        slug{current},
        _type
      }`;
      const sanityURL = `https://${sanityProjectID}.api.sanity.io/v2021-06-07/data/query/test?query=*[_id=="${sanityDocumentID}"]${projection}`;
      const response = await fetch(sanityURL);
      const json = await response.json();

      let { content, title } = json?.result[0];
      content = portableTextToPlainText(content);

      await index.saveObject({
        content,
        title,
        slug,
        objectID: sanityDocumentID,
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify(event),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    };
  }
};
