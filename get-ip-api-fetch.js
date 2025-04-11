/**
 * ---------------------------------------
 *  Push IP data to the dataLayer if found
 * ---------------------------------------
 */

// Optional: update this to match your tag name
var tagSource = 'Custom HTML - Get IP API Call - ipLookup - Fetch Version';

/**
 * Optional: helper function that pushes a script error event to the dataLayer.
 *
 * @param {string} type - The type of the error.
 * @param {string} message - The error message.
 */
function pushScriptError(type, message) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'scriptError',
    errorType: type,
    errorMessage: message,
    gtmTagName: tagSource
  });
}
 
/**
 * Set a session cookie.
 *
 * @param {string} name - The name of the cookie.
 * @param {string} value - The value to store in the cookie.
 */
function setIpCookie(name, value) {
  document.cookie = name + "=" + encodeURIComponent(value || "") + "; path=/";
}

/**
 * Retrieve the value of the 'ipLookUp' cookie.
 *
 * @returns {string|null} The decoded cookie value, or null if not found.
 */
function getIpLookUpCookieValue() {
  var match = document.cookie.match(new RegExp('(^|;\\s*)ipLookUp\\s*=\\s*([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// Attempt to read the cookie
var cookieValue = getIpLookUpCookieValue();

// Check if cookie already exists
if (cookieValue) {
  try {
    /**
     * Parse the cookie value and push to dataLayer
     */
    var cookieValueObject = JSON.parse(cookieValue);

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'ipLookupCookie',
      ipInfo: cookieValueObject
    });
  } catch (error) {
    /**
     * Push script error event if cookie contains badly formatted JSON
     */
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'scriptError',
      errorType: 'JSON Parse Error',
      errorMessage: error.message,
      gtmTagName: tagSource
    });
  }

} else {
  /**
   * Fetch IP address from external API and set cookie
   */
  (function getIpAddress() {
    fetch('https://api.ipapi.is/')
      .then(function(response) {
        return response.json(); // Automatically parses JSON and returns the object
      })
      .then(function(apiResponseObject) {
        try {
          /**
           * Convert the response object into a string format so it can be saved in a cookie
           */
          var ipResponseString = JSON.stringify(apiResponseObject);

          /*
           * Set a session cookie. This acts as a flag
           * to avoid hitting the API on every pageview.
           */
          setIpCookie("ipLookUp", ipResponseString);

          // Push the response object to the dataLayer
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: 'ipLookupAPI',
            ipInfo: apiResponseObject
          });

        } catch (error) {
          /**
           * Handle parsing issues with the API response
           */
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: 'scriptError',
            errorType: 'API Response Parse Error',
            errorMessage: error.message,
            gtmTagName: tagSource
          });
        }
      })
      .catch(function(error) {
        /**
         * Handle network or fetch errors
         */
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'scriptError',
          errorType: 'API Fetch Error',
          errorMessage: error.message,
          gtmTagName: tagSource
        });
      });
  })();
}
