// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2
const algoliasearch = require("algoliasearch");
const sanityClient = require("@sanity/client");
const indexer = require("sanity-algolia");

const algolia = algoliasearch(
  'C26QC41PWH',
  "e23b64dadd4c26f8678c15a2593521fa"
);

const sanity = sanityClient({
  projectId: 'sukats6f',
  dataset: 'test',
  apiVersion: '2022-09-25',
  useCdn: false,
});

const handler = async (event) => {
  const sanityAlgolia = indexer(
    {
      post: {
        index: algolia.initIndex('posts'),
      },
    },

    document => {
      switch (document._type) {
        case 'standard-article':
          return {
            title: document.title,
            path: document.slug.current,
            publishedAt: document.publishedAt,
            // excerpt: flattenBlocks(document.excerpt),
          };
        default:
          throw new Error(`Unknown type: ${document.type}`);
      }
    }
  );

  return sanityAlgolia
    .webhookSync(sanity, event.body || "oi")
    .then(() => {
      return {
        statusCode: 200,
        body: JSON.stringify(event, null, 2),
      }
    });

  try {

  } catch (error) {
    return {
      statusCode: 500,
      body: error.toString()
    }
  }
}

module.exports = { handler }
