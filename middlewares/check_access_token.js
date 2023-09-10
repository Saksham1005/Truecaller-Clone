const { User } = require("../models");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { errorResponse } = require("../middlewares/error_response");

require("dotenv").config();

module.exports.check_access_token = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    req.data = decode;

    if (!decode) {
      return errorResponse(res, "Auth Failed!", 400);
    }

    // console.log(decode);

    let user = await User.findOne({
      where: {
        number: decode.number,
      },
    });

    if (!user) {
      return errorResponse(res, "Auth Failed!", 400);
    }

    next();
  } catch (error) {
    // console.error(error);
    return errorResponse(res, "Internal Server Error!", 500);
  }
};
