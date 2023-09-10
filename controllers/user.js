const { User } = require("../models");
var validator = require("validator");
const { Op } = require("sequelize");
const { parse: parseUUID } = require("uuid");

const { errorResponse } = require("../middlewares/error_response");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();

let saltRounds = 10;

module.exports.sign_up = async (req, res) => {
  try {
    // Initialization
    const { name, number, email, password } = req.body;

    let user = await User.findOne({
      where: {
        number,
        name,
      },
    });

    if (user) {
      return errorResponse(res, "User already exists!", 400);
    }

    // check for valid input
    let regex =
      /^(\d{3}-\d{3}-\d{4}|\d{3}-\d{3}-\d{3}|\+\d{2,3} \d{2,3} \d{2,3} \d{2,3})$/;

    if (
      !password ||
      !email ||
      !validator.isEmail(email) ||
      !number ||
      !regex.test(number)
    ) {
      return errorResponse(res, "Bad Input!", 400);
    }

    // encrypt the password
    let hashed_password = await bcrypt.hash(password, saltRounds);

    await User.create({
      name,
      email,
      number,
      password: hashed_password,
      registered: true,
    });

    return res.status(201).json({
      message: "You are a registered User Now!",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Internal Server Error!", 500, error);
  }
};

module.exports.sign_in = async (req, res) => {
  try {
    // Initialization
    const { number, password } = req.body;

    let user = await User.findOne({
      where: {
        number: number,
      },
      raw: true,
    });

    if (!user) {
      return errorResponse(res, "User not found!", 400);
    }

    if (!user.registered) {
      return errorResponse(res, "User not registered!", 400);
    }

    let match = await bcrypt.compare(password, user.password);

    if (!match) {
      return errorResponse(res, "Invalid Email-Id/Password!", 400);
    }

    let data = user;

    // delete data.id;

    // Form jwt token
    let accessToken = jwt.sign(data, process.env.SECRET_KEY, {
      expiresIn: "180000000",
    });

    // delete data.password;

    return res.status(200).json({
      message: "Logged In!",
      success: true,
      data: { ...data, token: accessToken },
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Internal Server Error!", 500, error);
  }
};

module.exports.spam = async (req, res) => {
  try {
    // Initialization
    const spam_number = req.params.number;

    const spam_user = await User.findOne({
      where: {
        number: spam_number,
      },
    });

    if (!spam_user) {
      await User.create({
        number: spam_number,
        spam: 1,
      });
    } else {
      spam_user.spam++;

      await spam_user.save();
    }

    return res.status(201).json({
      message: "Successfully spammed a Number!",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Internal Server Error!", 500, error);
  }
};

module.exports.searchAll = async (req, res) => {
  try {
    // Initialization
    const field = req.params.field;

    let regex =
      /^(\d{3}-\d{3}-\d{4}|\d{3}-\d{3}-\d{3}|\+\d{2,3} \d{2,3} \d{2,3} \d{2,3})$/;

    // field is a number
    if (field && regex.test(field)) {
      let user = await User.findOne({
        where: {
          number: field,
          registered: true,
        },
        attributes: { exclude: ["password"] },
        raw: true,
      });

      if (user) {
        return res.status(200).json({
          message: "Search Successful. A registered user is found.",
          data: user,
          success: true,
        });
      } else {
        // showing all results where users are not registered
        let users = await User.findAll({
          where: {
            number: field,
          },
          attributes: { exclude: ["password"] },
          raw: true,
        });

        return res.status(200).json({
          message: "Search Successful. All unregistered users were found.",
          data: users,
          success: true,
        });
      }
    }

    // field is a name
    const startsWithQuery = {
      where: {
        name: {
          [Op.startsWith]: field,
        },
      },
      attributes: { exclude: ["password"] },

      raw: true,
    };

    const containsQuery = {
      where: {
        name: {
          [Op.like]: "_%" + field,
        },
      },
      attributes: { exclude: ["password"] },

      raw: true,
    };

    let usersStartWith = await User.findAll(startsWithQuery);
    let usersContainsWith = await User.findAll(containsQuery);

    let users = usersStartWith.concat(usersContainsWith);

    return res.status(200).json({
      message: "Search Successful!",
      data: users,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Internal Server Error!", 500, error);
  }
};

module.exports.search = async (req, res) => {
  try {
    // Initialization
    const id = req.params.field;

    let user = await User.findOne({
      where: {
        id,
      },
      attributes: { exclude: ["password"] },
      raw: true,
    });

    if (!user) {
      return errorResponse(res, "User not found!", 400);
    }

    if (user && user.registered == true) {
      return res.status(200).json({
        message: "Successfully fetched user profile!",
        data: user,
        success: true,
      });
    }

    delete user.email;

    return res.status(201).json({
      message: "Successfully fetched user profile!",
      data: user,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Internal Server Error!", 500, error);
  }
};
