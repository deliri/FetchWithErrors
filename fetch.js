
// Base URL for API requests
const API_URL = "{{your_site_base_url}}";

/**
 * Parses a JSON string and returns an object. Returns the original data if parsing fails.
 * @param {string} data - The JSON string to parse.
 * @returns {object|string} - The parsed object or the original data.
 */
function tryParseJson(data) {
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}

/**
 * Formats the API response for error messages.
 * @param {object|string} response - The API response to format.
 * @returns {string} - The formatted response.
 */
function formatResponse(response) {
  return typeof response === 'object' ? JSON.stringify(response, null, 2) : response;
}

/**
 * Constructs the full error message for API errors.
 * @param {string} message - The error message.
 * @param {any} data - The error data.
 * @param {number} status - The HTTP status code.
 * @returns {string} - The full error message.
 */
function constructErrorMessage(message, data, status) {
  const response = tryParseJson(data);
  return `${message}\nResponse:\n${formatResponse(response)}`;
}

/**
 * Fetches a resource from the API.
 * @param {string} path - The API endpoint path.
 * @param {object} userOptions - The fetch options provided by the user.
 * @returns {Promise<object>} - The fetched resource.
 */
async function fetchResource(path, userOptions = {}) {
  const options = prepareRequestOptions(userOptions);
  const url = `${API_URL}/${path}`;

  try {
    const response = await fetch(url, options);
    await handleResponse(response);
    return response.json();
  } catch (error) {
    handleFetchError(error, response);
  }
}

/**
 * Prepares the options for the fetch request.
 * @param {object} userOptions - User-provided fetch options.
 * @returns {object} - The prepared fetch options.
 */
function prepareRequestOptions(userOptions) {
  const defaultOptions = {};
  const defaultHeaders = {};

  return {
    ...defaultOptions,
    ...userOptions,
    headers: {
      ...defaultHeaders,
      ...userOptions.headers,
    },
  };
}

/**
 * Handles the response from the fetch request.
 * @param {Response} response - The response object from the fetch request.
 * @returns {Promise<void>}
 */
async function handleResponse(response) {
  if (response.status === 401) {
    // Handle unauthorized requests, e.g., redirect to login
    throw new Error('Unauthorized request');
  }

  if (!response.ok) {
    const errorText = await response.text();
    const errorMessage = constructErrorMessage(
      `Request failed with status ${response.status}.`,
      errorText,
      response.status
    );
    throw new Error(errorMessage);
  }
}

/**
 * Handles errors that occur during the fetch request.
 * @param {Error} error - The error object.
 * @param {Response} response - The response object from the fetch request.
 * @throws {Error} - The constructed error with detailed message.
 */
function handleFetchError(error, response) {
  if (response) {
    const errorMessage = constructErrorMessage(
      `Request failed with status ${response.status}.`,
      error,
      response.status
    );
    throw new Error(errorMessage);
  } else {
    throw new Error(error.toString());
  }
}
