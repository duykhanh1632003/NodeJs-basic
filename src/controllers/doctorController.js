import doctorService from "../services/doctorService"

let getTopDoctorHome = async (req , res) =>{
	let limit  = req.query.limit
	if(!limit) limit = 10;
	try{
		let response = await doctorService.getTopDoctorHome(+limit)
		return res.status(200).json(response)
	}
	catch(e){
		console.log(e)
		return res.status(200).json({
			errCode :-1,
			message : "Error from sever..."
		})
	}
}

let getAllDoctors = async (req, res) =>{
	try{
		let doctors =await doctorService.getAllDoctors()
		return res.status(200).json(doctors)
	}
	catch(e){
		console.log(e)
		return res.status(200).json({
			errCode:-1,
			errMessage:'Error from the sever'
		})
	}
}

let postInforDoctors  =async (req , res) => {
	try{
		console.log("CHECK REQ",req.body)
		let response = await doctorService.saveDetailInforDoctors(req.body)
		return res.status(200).json(response)
	}
	catch(e){
		console.log(e)
	}
}

let getDetailDoctorById =async (req , res) => {
	try{
		let infor = await doctorService.getDetailDoctorById(req.query.id)
		res.status(200).json(infor)
	}
	catch(e){
		console.log(e)
		return res.status(200).json({
			errCode: -1 ,
			errMessage : "Error from the sever"
		})
	}
}

let bulkCreateSchedule = async (req , res) =>{
	try{
		let infor = await doctorService.bulkCreateDoctor(req.body)
		return res.status(200).json(infor)
	}
	catch(e){
		console.log(e)
		return res.status(200).json({
			errCode: -1 ,
			errMessage : "Error from the sever"
		})
	}
}

let getScheduleByDate =async (req , res) =>{
	try{
		let infor = await doctorService.getScheduleByDate(req.query.doctorId , req.query.date)
		return res.status(200).json(infor)
	}
	catch(e){
		console.log(e)
		return res.status(200).json({
			errCode: -1 ,
			errMessage : "Error from the sever"
		})
	}
}

module.exports = {
	getTopDoctorHome: getTopDoctorHome,
	getAllDoctors:getAllDoctors,
	postInforDoctors:postInforDoctors,
	getDetailDoctorById:getDetailDoctorById,
	bulkCreateSchedule:bulkCreateSchedule,
	getScheduleByDate:getScheduleByDate
}