const Admin = require("../model/admin.model");
const jwt = require("jsonwebtoken");

const authentication = async (req, res, next) => {
  try {
    // Check if req.cookies is defined
    console.log(req.cookies);
    if (req.cookies && req.cookies.token) {
      const Token = req.cookies.token;
      const verifyAdmin = jwt.verify(Token,process.env.JWT_KEY);
      if (verifyAdmin === undefined) {
        req.flash("success","unauthorized");
        res.redirect("/admin/login");
      } else {
        const adminData = await Admin.findById(verifyAdmin.id);
        if (adminData === null) {
          res.redirect("/admin/login");
        } else {
          req.admin = adminData;
          req.token = Token;
          next();
        }
      }
    } else {
      res.redirect("/admin/login");
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
