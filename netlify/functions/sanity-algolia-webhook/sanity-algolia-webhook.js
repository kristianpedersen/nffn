// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2
const algoliasearch = require("algoliasearch");
const sanityClient = require("@sanity/client");
const indexer = require("sanity-algolia");
console.log(indexer.default);
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
  // `indexer` contains three functions: `default`, `flattenBlocks` og `indexMapProjection`
  // It seems that we need to access `indexer.default` explicitly when not using JS import syntax
  const sanityAlgolia = indexer.default(
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
    .webhookSync(sanity, "oi")
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
