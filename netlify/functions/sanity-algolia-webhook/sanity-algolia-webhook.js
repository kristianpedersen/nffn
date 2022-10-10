// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2
const algoliasearch = require("algoliasearch");
const sanityClient = require("@sanity/client");
const indexer = require("sanity-algolia");

const algolia = algoliasearch(
  'C26QC41PWH',
  "e23b64dadd4c26f8678c15a2593521fa"
);

const sanityClientInstance = sanityClient({
  projectId: 'sukats6f',
  dataset: 'test',
  apiVersion: '2022-09-25',
  useCdn: false,
});

const handler = async (event) => {
  const sanityAlgolia = indexer.default(
    {
      post: {
        index: algolia.initIndex("test_index"),
        projection: `{
          title,
          "path": slug.current,
          "body": pt::text(body)
        }
        `
      }
    },

    document => {
      return document;
    }
  );

  // const test = await sanityAlgolia.webhookSync(sanityClientInstance, event.body);

  return {
    statusCode: 200,
    body: `Alt gikk bra!`
  };
}

module.exports = { handler }
