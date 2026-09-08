/**
 * @typedef {{
 *  path: string,
 *  httpMethod: string,
 *  headers: Record<string,
 *  string>,
 *  queryStringParameters: Record<string,
 *  string>,
 *  body: string,
 *  isBase64Encoded: boolean
 * }} NetlifyEvent
 */

/**
 * @typedef {{
 *   isBase64Encoded?: boolean,
 *   statusCode: 200 | 400 | 500 | 300,
 *   headers?: Record<string,string>,
 *   multiValueHeaders?: Record<string, string[]>,
 *   body: string
 * }} NetlifyReturn
 */

const fetch = require('node-fetch')
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/**
 * 
 * @param {NetlifyEvent} event
 * @param context
 * @returns {Promise<NetlifyReturn>}
 */
async function updateScore(event, context) {
  const userData = JSON.parse(event.body);

  // Validation
  const body = {
    name: DOMPurify.sanitize(userData.name),
    score: Number.parseInt(userData.score?.toString()) 
  };

  console.log(body.name);

  if (!body.name) throw new Error("missing parameter: name");
  if (body.score === undefined || isNaN(body.score)) throw new Error("missing parameter: score");

  const binUrl = 'https://api.jsonbin.io/v3/b/6a9f5a6cffd5d16053eb3e15';
  const headers = { 
    'X-Master-Key': `${process.env.JSON_KEY}`,
    'Content-Type': 'application/json'
  };

  try {
    const getResponse = await fetch(binUrl, { method: "GET", headers });
    if (!getResponse.ok) throw new Error("Failed to fetch current state");
    
    const getData = await getResponse.json();
    
    const currentList = Array.isArray(getData.record) ? getData.record : [];
    currentList.push(body);

    const putResponse = await fetch(binUrl, {
      method: "PUT",
      headers,
      body: JSON.stringify(currentList)
    });

    if (!putResponse.ok) throw new Error("Failed to save updated state");

    return {
      statusCode: 200,
      body: JSON.stringify({ status: "success" })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ status: "error", message: error.message })
    };
  }
}
exports.handler = updateScore