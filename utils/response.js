/**
 * Standard Success Response
 * @param {Object} res - Express response object
 * @param {any} data - Response Data (default: [])
 * @param {string} message 
 * @param {number} statusCode - HTTP Status Code (default: 200)
 */
const successResponse = (res, data = [], message = "success", statusCode = 200) => {
  return res.status(statusCode).json({
    status: statusCode,
    message,
    data,
  });
};

/**
 * Standard Error Response
 * @param {Object} res - Express response object
 * @param {string} message
 * @param {number} statusCode - HTTP Status Code (default: 500)
 */
const errorResponse = (res, message = "Internal Server Error", statusCode = 500) => {
  return res.status(statusCode).json({
    status: statusCode,
    message,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
