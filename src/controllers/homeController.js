import db from '../models/index'
import CRUDservice from '../services/CRUDservice'

let getHomePage = async (req , res) => {

	try{
		let data = await db.User.findAll();

		return res.render('homepage.ejs',{
			data: JSON.stringify(data)
		});
	}catch(e){
		console.log(e)
	}
}


let abouHomepage = (req , res) => {
	return res.render('test/about.ejs');
}

let getCRUD = (req , res) =>{
	return res.render('test/crud.ejs');
}

let postCRUD = async(req , res) =>{
	let message = await CRUDservice.createNewUser(req.body);
	return res.send('post CRUD')

}

let displayGetCRUD = async (req , res) =>{
	let data = await CRUDservice.getAllUser(
	);
	return res.render('test/displayCRUD.ejs',{
		dataTable: data
	})
}

let getEditCRUD = async (req, res) => {
	let userId = req.query.id;
	console.log(userId);
	if (userId) {
	  try {
		let userData = await CRUDservice.getUserInfoById(userId);
		return res.render('test/editCURD.ejs',{
			user: userData
		});
	  } catch (e) {
		console.log(e);
		return res.send('Error');
	  }
	} else {
	  return res.send('Hello from Khanh');
	}
  };

  let putCRUD =async (req , res) =>{
	let data = req.body;
	let allUsers = await CRUDservice.UpdateUserData(data);
	return res.render('test/displayCRUD.ejs',{
		dataTable : allUsers	
	})
  }
  let deleteCRUD = async (req, res) => {
	let id = req.query.id;
	if (id) {
	  await CRUDservice.deleteUserById(id);
	  return res.send('Delete User succeed');
	} else {
	  res.send('User not found!');
	}
  };
  
  
module.exports = {
	getHomePage: getHomePage,
	abouHomepage : abouHomepage,
	getCRUD : getCRUD,
	postCRUD : postCRUD,
	displayGetCRUD:displayGetCRUD,
	getEditCRUD:getEditCRUD,
	putCRUD: putCRUD,
	deleteCRUD : deleteCRUD,
}