module.exports.errorResponse = (res, message, status, info) => {
  return res.status(status).json({
    message,
    ...(info && { info }),
    success: false,
  });
};
