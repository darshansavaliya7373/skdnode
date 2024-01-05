const jwt = require("jsonwebtoken");
const userModel = require("../model/user.model");

const authentication = async (req, res, next) => {
  try {
    if (req.headers && req.headers.token) {
      const Token = req.headers.token;
      const verifyAdmin = jwt.verify(Token, process.env.JWT_KEY);
      if (verifyAdmin === undefined) {
        req.flash("success", "unauthorized");
        return res.status(400).json({ message: "unauthorized token" });
      } else {
        const userData = await userModel.findById(verifyAdmin.id);
        if (userData === null) {
          return res.json({ message: "token data not found" });
        } else {
          req.user = userData;
          req.token = Token;
          next();
        }
      }
    } else {
      return res.status(400).json({ message: "token not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "SOMETHING WENT WRONG",
      status: 500,
    });
  }
};

module.exports = authentication;
