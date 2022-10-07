// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2
const algoliasearch = require("algoliasearch");

const handler = async (event) => {
  console.log("It's webhook time!");
  try {
    console.log("Try")
    const subject = event.queryStringParameters.name || 'World'
    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Hello ${subject}` }),
      // // more keys you can return:
      // headers: { "headerName": "headerValue", ... },
      // isBase64Encoded: true,
    }
  } catch (error) {
    console.log("Try")
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }
