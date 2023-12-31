import express from "express";
import homeController, { abouHomepage } from "../controllers/homeController";
import userController from "../controllers/userController";
import doctorController from "../controllers/doctorController"
let router = express.Router();



let initWebRoutes = (app) => {
	

    router.get('/',homeController.getHomePage)	
	router.get('/about', abouHomepage)
	router.get('/crud', homeController.getCRUD)
	router.post('/post-crud', homeController.postCRUD);
	router.get('/get-crud' , homeController.displayGetCRUD);
	router.get('/edit-crud' , homeController.getEditCRUD);
	
	router.post('/put-crud' , homeController.putCRUD);
	router.get('/delete-crud' , homeController.deleteCRUD);
	
	router.post('/api/login', userController.handleLogin);
	router.get('/api/get-all-users',userController.handleGetAllUsers);
	router.post('/api/create-new-user', userController.handleCreateNewUser)
	router.put('/api/edit-new-user', userController.handleEditUser)
	router.delete('/api/delete-new-user', userController.handleDeleteUser)
	router.get('/api/allcode', userController.getAllCode);
	router.get('/api/top-doctor-home', doctorController.getTopDoctorHome);
	router.get('/api/get-all-doctors', doctorController.getAllDoctors);
	router.post('/api/save-infor-doctors',doctorController.postInforDoctors)

	router.get('/api/get-detail-doctor-by-id',doctorController.getDetailDoctorById)
	router.post('/api/bulk-create-schedule', doctorController.bulkCreateSchedule)
	router.get('/api/get-schedule-doctor-by-date',doctorController.getScheduleByDate)
	router.get('/api/get-extra-doctor-infor-by-id',doctorController.getExtraInforDoctorById)


    return app.use("/", router);
}
module.exports = initWebRoutes;