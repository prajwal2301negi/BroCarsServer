// import jwt from 'jsonwebtoken'

// export const sendToken = (user, statusCode, message, res) => {
//     const tokenu = jwt.sign({ id: user._id }, process.env.JWT_REFRESHTSECRETC, {
//         expiresIn: process.env.JWT_REFRESHTEXPIRESC,
//     });
//     user.token = tokenu;

//     res.status(statusCode).cookie("tokenu", tokenu, {
//         expires: new Date(Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
//         httpOnly: true,
//         secure:true,
//         sameSite: "none",
//     }).json({
//         success: true,
//         message,
//         user: {
//             name: user.name,
//             email: user.email,
//             phone: user.phone,
//         },
//     })
// };


import jwt from "jsonwebtoken";

export const sendToken = (user, statusCode, message, res) => {
  const tokenu = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESHTSECRETC,
    { expiresIn: process.env.JWT_REFRESHTEXPIRESC }
  );

  user.token = tokenu;

  res.status(statusCode).json({
    success: true,
    message,
    token: tokenu,
    user: {
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  });
};

export const sendTokenAdmin = (user, statusCode, message, res) => {
  const tokena = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESHTSECRETA,
    { expiresIn: process.env.JWT_REFRESHTEXPIRESA }
  );

  user.token = tokena;

  res.status(statusCode).json({
    success: true,
    message,
    token: tokena,
    user: {
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  });
};


// export const sendTokenAdmin = (user, statusCode, message, res) => {

//     const tokena = jwt.sign({ id: user._id }, process.env.JWT_REFRESHTSECRETA, {
//         expiresIn: process.env.JWT_REFRESHTEXPIRESA,
//     });
//     user.token = tokena;

//     res.status(statusCode).cookie("tokena", tokena, {
//         expires: new Date(Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
//         httpOnly: true,
//         secure:true,
//         sameSite: "none",
//     }).json({
//         success: true,
//         message,
//         user: {
//             name: user.name,
//             email: user.email,
//             phone: user.phone,
//         },
//     })
// };
