import db from "../models";
require("dotenv").config;
import { Sequelize } from "sequelize";
import _, { reject } from "lodash"
const MAX_NUMER_SCHEDULE = process.env.MAX_NUMER_SCHEDULE;

let getTopDoctorHome = (limit) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = await db.User.findAll({
        limit: limit, // Sử dụng tham số limit được truyền vào
        where: { roleId: "R2" },
        order: [["createdAt", "DESC"]],
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            model: db.Allcode,
            as: "positionData",
            attributes: ["valueEn", "valueVi"],
          },
          {
            model: db.Allcode,
            as: "genderData",
            attributes: ["valueEn", "valueVi"],
          },
        ],
        raw: true,
        nest: true,
      });
      resolve({
        errCode: 0,
        data: users,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let getAllDoctors = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let doctors = await db.User.findAll({
        where: { roleId: "R2" },
        attributes: {
          exclude: ["password", "image"],
        },
      });
      resolve({
        errCode: 0,
        data: doctors,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let saveDetailInforDoctors = (inputData) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !inputData ||
        !inputData.contentHTML ||
        !inputData.contentMarkdown ||
        !inputData.action ||
        !inputData.selectedPrice|| 
        !inputData.selectedPayment || 
        !inputData.selectedProvince ||
        !inputData.nameClinic || 
        !inputData.addressClinic || 
        !inputData.note

      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing parameter",
        });
      } else {
        if (inputData.action === "CREATE") {
          await db.Markdown.create({
            contentHTML: inputData.contentHTML,
            contentMarkdown: inputData.contentMarkdown,
            description: inputData.description,
            doctorId: inputData.doctorId,
          });
        } else if (inputData.action === "EDIT") {
          let doctorMarkdown = await db.Markdown.findOne({
            where: { doctorId: inputData.doctorId },
            raw: false,
          });
          if (doctorMarkdown) {
            (doctorMarkdown.contentHTML = inputData.contentHTML),
              (doctorMarkdown.contentMarkdown = inputData.contentMarkdown),
              (doctorMarkdown.description = inputData.description);
            await doctorMarkdown.save();
          }
        
        }
        let doctorInfor = await db.Doctor_Infor.findOne({
          where : {
            doctorId: inputData.doctorId,
            
          },
          raw: false
        })

        if(doctorInfor){
          //update
          doctorInfor.doctorId = inputData.doctorId
          doctorInfor.priceId = inputData.selectedPrice,
          doctorInfor.provinceId = inputData.selectedProvince.value,
          doctorInfor.paymentId = inputData.selectedPayment.value,

          doctorInfor.addressClinic = inputData.addressClinic,
          doctorInfor.nameClinic = inputData.nameClinic,
          doctorInfor.note = inputData.note,
          await doctorInfor.save()
        }

        else{
          //create
          await db.Doctor_Infor.create({
            doctorId: inputData.doctorId,
            priceId : inputData.selectedPrice,
            provinceId : inputData.selectedProvince.value,
            paymentId : inputData.selectedPayment.value,
            addressClinic : inputData.addressClinic,
            nameClinic : inputData.nameClinic,
            note : inputData.note,
          });
        }
        resolve({
          errCode: 0,
          errMessage: "Save infor doctor success",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getDetailDoctorById = async (id) => {
  try {
    if (!id) {
      return {
        errCode: 1,
        errMessage: "Missing required parameter",
      };
    } else {
      // Sử dụng hàm findOne để tìm thông tin của bác sĩ dựa trên id
      const data = await db.User.findOne({
        where: { id: id },
        attributes: {
          exclude: ["password"], // Loại trừ trường password và image trong kết quả truy vấn
        },
        include: [
          {
            model: db.Markdown,
            attributes: ["description", "contentHTML", "contentMarkdown"],
          },
          {
            model: db.Allcode,
            as: "positionData",
            attributes: ["valueEn", "valueVi"],
          },
          {
            model: db.Doctor_Infor,
            attributes: {
              exclude: ["id", "doctorId"],
            },
            include:[
              {model: db.Allcode,as: "priceTypeData",attributes: ["valueEn", "valueVi"],},
              {model: db.Allcode,as: "provinceTypeData",attributes: ["valueEn", "valueVi"],},
              {model: db.Allcode,as: "paymentTypeData",attributes: ["valueEn", "valueVi"],}
            ]
          },
        ],
      

        raw: false,
        nest: true,
      });

      // Nếu không tìm thấy bác sĩ, trả về lỗi
      if (!data) {
        return {
          data: {},
          errCode: 404,
          errMessage: "Doctor not found",
        };
      } else {
        if (data && data.image) {
          data.image = new Buffer(data.image, "base64").toString("binary");
        }
        return {
          errCode: 0,
          data: data,
        };
      }
    }
  } catch (e) {
    console.log(e);
    return {
      errCode: -1,
      errMessage: "Error from the server",
    };
  }
};

let bulkCreateDoctor = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.arrSchedule  || !data.doctorId || !data.FormattedDate) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter",
        });
      } else {
        let Schedule = data.arrSchedule;
        if (Schedule && Schedule.length > 0) {
          Schedule = Schedule.map((item) => {
            item.maxNumber = MAX_NUMER_SCHEDULE;
            return item;
          });
        }

        let existing  = await db.schedule.findAll (
          {
          where: {doctorId : data.doctorId,
          date : data.FormattedDate
          },
          attributes: ['timeType' , 'date' , 'doctorId' , 'maxNumber'],
          raw: true
        })



        let toCreate = _.differenceWith(Schedule, existing, (a,b)=> {
          return a.timeType === b.timeType && +a.date === +b.date
        })


        if(toCreate && toCreate.length > 0){
          await db.schedule.bulkCreate(toCreate);
        }

        resolve({
          errCode: 0,
          errMessage: "Done",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getScheduleByDate = (doctorId, date) =>{
  return new Promise( async (resolve , reject) =>{
    try{
      if(!doctorId || !date){
        resolve({
          errCode: 1,
          errMessage: "Missing required prameter"
        })

      }
      else{
        let dataSchedule = await db.schedule.findAll({
          where: {doctorId : doctorId , date : date},

          include :[
            {
              model: db.Allcode,
              as: "timeTypeData",
              attributes: ["valueEn", "valueVi"],
            },
            
          ],
        
  
          raw: false,
          nest: true,
        })
        if(!dataSchedule){  
          dataSchedule = []
        }
        resolve({
          errCode: 0 ,
          data: dataSchedule
        })
      }
      
    }
    catch(e){
      reject(e)
    }
  })
}

let getExtraInforDoctorById  =(doctorId) =>{
  return new Promise( async (resolve ,reject) =>{
    try{
      if(!doctorId){
        resolve({
          errCode:1,
          errMessage: "Missing required parameter"
        })
      }
      else{
        let data = await db.Doctor_Infor.findOne({
          where: {doctorId : doctorId},
          attributes:{
            exclude : ['id' , 'doctorId']
          },
          include:[
            {model: db.Allcode,as: "priceTypeData",attributes: ["valueEn", "valueVi"],},
            {model: db.Allcode,as: "provinceTypeData",attributes: ["valueEn", "valueVi"],},
            {model: db.Allcode,as: "paymentTypeData",attributes: ["valueEn", "valueVi"],}
          ],
          raw: false,
          nest: true
        })
        resolve({
          errCode: 0,
          data : data
        })
      }
    }
    catch(e){
      reject(e)
    }
  })
}



module.exports = {
  getTopDoctorHome: getTopDoctorHome,
  getAllDoctors: getAllDoctors,
  saveDetailInforDoctors: saveDetailInforDoctors,
  getDetailDoctorById: getDetailDoctorById,
  bulkCreateDoctor: bulkCreateDoctor,
  getScheduleByDate: getScheduleByDate,
  getExtraInforDoctorById: getExtraInforDoctorById
};
