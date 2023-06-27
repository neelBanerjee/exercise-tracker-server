
const JWT = require('jsonwebtoken');

const userAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  // if (!authHeader || !authHeader.startsWith("Bearer")) {
  //   next("Auth Failed");
  // }
  if (authHeader && authHeader.startsWith("Bearer")) {
    const token = authHeader.split(" ")[1];
    //console.log(token);
    try {
      const payload = JWT.verify(token, process.env.JWTPRIVATEKEY);
      req.user = { userId: payload.userId };
      next();
    } catch (error) {
      // console.log(token);
      next("Auth Failed");
    }
  }else{
    next("Auth Failed");
  }
};

module.exports = userAuth;