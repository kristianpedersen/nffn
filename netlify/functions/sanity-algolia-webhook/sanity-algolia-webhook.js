const algoliasearch = require("algoliasearch");
const sanityClient = require("@sanity/client");
const indexer = require("sanity-algolia");

const client = algoliasearch(
  'C26QC41PWH',
  "e23b64dadd4c26f8678c15a2593521fa"
);

const sanityClientInstance = sanityClient({
  projectId: 'sukats6f',
  dataset: 'test',
  apiVersion: '2022-09-25',
  useCdn: false,
});

const index = client.initIndex("Sanity-Algolia");
// const articlesJSON = require("./articles.json");

// index.saveObjects(articlesJSON.result, {
//   autoGenerateObjectIDIfNotExist: true
// }).then(({ objectIDs }) => {
//   console.log(objectIDs);
// });

const mapDocumentTypeToSearchIndex = {
  post: {
    index,
    projection: `{
          title,
          "path": slug.current,
          "body": pt::text(body)
        }`,
  },

  article: {
    index,
    projection: `{
          heading,
          "body": pt::text(body),
          "authorNames": authors[]->name
        }`,
  },
};

const convertSanityDocumentToAlgoliaRecord = document => {
  switch (document._type) {
    case 'post':
      return Object.assign({}, document, {
        custom: 'An additional custom field for posts, perhaps?',
      })
    case 'article':
      return {
        title: document.heading,
        body: document.body,
        authorNames: document.authorNames,
      }
    default:
      return document
  }
}

const handler = event => {
  const sanityAlgolia = indexer(mapDocumentTypeToSearchIndex, convertSanityDocumentToAlgoliaRecord);

  return sanityAlgolia
    .webhookSync(sanityClientInstance, event.body)
    .then(() => {
      return {
        statusCode: 200,
        body: `Alt gikk bra!`
      };
    })
}

module.exports = { handler }