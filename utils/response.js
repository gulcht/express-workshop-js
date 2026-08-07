/**
 * Standard Success Response
 * @param {Object} res - Express response object
 * @param {any} data - Response Data
 * @param {string} message - Response Message (default: "success")
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
 * @param {string} message - Error Message
 * @param {number} statusCode - HTTP Status Code (default: 500)
 * @param {any} data - Response Data (default: null)
 */
const errorResponse = (res, message = "Internal Server Error", statusCode = 500, data = null) => {
  return res.status(statusCode).json({
    status: statusCode,
    message,
    data,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
