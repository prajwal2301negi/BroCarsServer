// import express from 'express';
// import { isUserAuthenticated, isAuthenticated } from '../utils/auth.js';
// import { approvedCarsForTestDrive, approveTestDrive, bookATestDrive, deleteCar, getACar, getCars, getUnverifiedCars, getVerifiedCars, listCar1, listCar2, listCar3, listCar4, unApprovedCarsForTestDrive, unApproveTestDrive, updateCarVerification } from '../controllers/car.controllers.js';


// const router =  express.Router();

// router.post("/listCar1", isUserAuthenticated, listCar1);
// router.put('/listCar2', isUserAuthenticated, listCar2);
// router.put('/listCar3', isUserAuthenticated, listCar3);
// router.put('/listCar4', isUserAuthenticated, listCar4);



// router.get('/getACar/:carId', isUserAuthenticated, getACar)

// router.post('/bookTestDrive/:carId', isUserAuthenticated, bookATestDrive)
// router.get("/verifiedCars", getVerifiedCars);







// router.get("/unverifiedCars", getUnverifiedCars );

// router.put("/updateCarVerification/:carId",  updateCarVerification)

// router.get("/getCars",  getCars);
// router.delete("/deleteCar/:carId", deleteCar);


// router.get('/upApprovedCarsForTestDrive',  unApprovedCarsForTestDrive);
// router.get('/approvedCarsForTestDrive',  approvedCarsForTestDrive);
// router.put('/approveTestDrive/:testDriveId', approveTestDrive);
// router.put('/revokeTestDrive/:testDriveId',  unApproveTestDrive);




// export default router;




import express from 'express';
import { isUserAuthenticated, isAuthenticated } from '../utils/auth.js';
import { approvedCarsForTestDrive, approveTestDrive, bookATestDrive, deleteCar, getACar, getCars, getUnverifiedCars, getVerifiedCars, listCar1, listCar2, listCar3, listCar4, unApprovedCarsForTestDrive, unApproveTestDrive, updateCarVerification } from '../controllers/car.controllers.js';


const router =  express.Router();

router.post("/listCar1", listCar1);
router.put('/listCar2', listCar2);
router.put('/listCar3', listCar3);
router.put('/listCar4', listCar4);



router.get('/getACar/:carId', getACar)

router.post('/bookTestDrive/:carId', bookATestDrive)
router.get("/verifiedCars", getVerifiedCars);







router.get("/unverifiedCars", getUnverifiedCars );

router.put("/updateCarVerification/:carId",  updateCarVerification)

router.get("/getCars", getCars);
router.delete("/deleteCar/:carId", deleteCar);


router.get('/upApprovedCarsForTestDrive',  unApprovedCarsForTestDrive);
router.get('/approvedCarsForTestDrive',  approvedCarsForTestDrive);
router.put('/approveTestDrive/:testDriveId', approveTestDrive);
router.put('/revokeTestDrive/:testDriveId',  unApproveTestDrive);



export default router;
