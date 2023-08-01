const db = require('../models/index');
const bcrypt = require('bcryptjs');

const saltRounds = 10;

let hashUserPassword = (password) => {
  return new Promise(async (resolve, reject) => {
    try {
      var hashPassword = await bcrypt.hashSync(password, saltRounds);
      resolve(hashPassword);
    } catch (e) {
      reject(e);
    }
  });
};

const handleUserLogin = (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let userData = {};
      let isExist = await checkUserEmail(email);
      if (isExist) {
        let user = await db.User.findOne({
          attributes: ['email', 'roleId', 'password','firstName', 'lastName'],
          where: { email: email },
          raw: true,
        });
        if (user) {
          let isPasswordMatch = await bcrypt.compare(password, user.password);
          if (isPasswordMatch) {
            userData.errCode = 0;
            userData.errMessage = 'OK';

            delete user.password;
            userData.user = user;
          } else {
            userData.errCode = 3;
            userData.errMessage = 'Wrong password';
          }
        } else {
          userData.errCode = 2;
          userData.errMessage = 'User does not exist';
        }
      } else {
        userData.errCode = 1;
        userData.errMessage = 'Email does not exist';
      }
      resolve(userData);
    } catch (error) {
      reject(error);
    }
  });
};

const checkUserEmail = (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await db.User.findOne({
        where: { email: email }
      });
      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  }); 
};

let getAllUsers = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = '';
      if (userId === 'ALL') {
        users = await db.User.findAll({
          attributes: {
            exclude: ['password']
          }
        });
      }
      if (userId && userId !== 'ALL') {
        users = await db.User.findOne({
          where: { id: userId },
          attributes: {
            exclude: ['password']
          }
        });
      }
      resolve(users);
    } catch (e) {
      reject(e);
    }
  });
};

let createNewUser = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let check = await checkUserEmail(data.email);
      if (check) {
        resolve({
          errCode: 1,
          errMessage: "Your email is already used, please try another email!"
        });
      } else {
        let hashPasswordFromBcrypt = await hashUserPassword(data.password);
        await db.User.create({
          email: data.email,
          password: hashPasswordFromBcrypt,
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          phonenumber: data.phonenumber,
          gender: data.gender,
          roleId: data.roleId,
          positionId: data.positionId,
          image : data.avatar
          
        });
        resolve({
          errCode: 0,
          message: 'OK'
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let deleteUser = (userId) => {
  return new Promise(async (resolve, reject) => {
    let foundUser = await db.User.findOne({
      where: { id: userId }
    });
    if (!foundUser) {
      resolve({
        errCode: 2,
        errMessage: "The user doesn't exist"
      });
    }
    await db.User.destroy({
      where: { id: userId }
    });
    resolve({
      errCode: 0,
      message: "The user has been deleted"
    });
  });
};

let UpdateUserData = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.id || !data.roleId || !data.gender || !data.positionId) {
        resolve({
          errCode: 2,
          errMessage: 'Missing required parameters'
        });
      }
      let user = await db.User.findOne({
        where: { id: data.id },
        raw: false
      });
      if (user) {
        user.firstName = data.firstName;
        user.lastName = data.lastName;
        user.address = data.address;
        user.roleId = data.roleId
        user.gender = data.gender
        user.positionId = data.positionId
        user.phonenumber = data.phonenumber
        
        if(data.avatar){
          user.image = data.avatar
        }
        await user.save();

        resolve({
          errCode: 0,
          message: 'Update the user success!'
        });
      } else {
        resolve({
          errCode: 1,
          errMessage: `User not found!`
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getAllCodeService = (typeInput) =>{
  return new Promise (async (resolve , reject) =>{
      try{
        if(!typeInput){
          resolve({
            errCode:1,
            errMessage:"Missing required parameters"
          })
        }
        else{
          let res = {};
          let allcode = await db.Allcode.findAll({
            where: {type : typeInput}
          })
          res.errCode = 0;
          res.data = allcode;
          resolve(res)
        }
      }
      catch(e){
        reject(e)
      }
  })
}


module.exports = {
  handleUserLogin: handleUserLogin,
  getAllUsers: getAllUsers,
  createNewUser: createNewUser,
  deleteUser: deleteUser,
  UpdateUserData: UpdateUserData,
  getAllCodeService:getAllCodeService
};
