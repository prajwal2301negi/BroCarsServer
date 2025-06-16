import Car from "../models/car.models.js";
import asyncErrorHandler from "../middlewares/asyncErrorHandler.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import cloudinary from "cloudinary";
// create Car
export const listCar1 = asyncErrorHandler(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler(" Shoe Display Image Required!", 400));
  }
  const { displayImg, image2Avatar, image3Avatar, image4Avatar } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp", "image/avif"];
  if (
    !allowedFormats.includes(displayImg.mimetype) ||
    (image2Avatar && !allowedFormats.includes(image2Avatar.mimetype)) ||
    (image3Avatar && !allowedFormats.includes(image3Avatar.mimetype)) ||
    (image4Avatar && !allowedFormats.includes(image4Avatar.mimetype))
  ) {
    return next(new ErrorHandler("File Format Not Supported", 400));
  }

  const { make, model, variant, year } = req.body;
  if (!make || !model || !variant || !year) {
    return next(new ErrorHandler("Fill the credentials", 400));
  }

  const user = req.user;
  const userId = user._id;

  const cloudinaryResponse = await cloudinary.uploader.upload(
    displayImg.tempFilePath
  );
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponse.error || "Unknown Cloudinary Error"
    );
    return next(
      new ErrorHandler("Failed To Upload Avatar1 To Cloudinary", 500)
    );
  }

  const cloudinaryResponse2 = await cloudinary.uploader.upload(
    image2Avatar.tempFilePath
  );
  if (!cloudinaryResponse2 || cloudinaryResponse2.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponse2.error || "Unknown Cloudinary Error"
    );
    return next(
      new ErrorHandler("Failed To Upload  Avatar2 To Cloudinary", 500)
    );
  }

  const cloudinaryResponse3 = await cloudinary.uploader.upload(
    image3Avatar.tempFilePath
  );
  if (!cloudinaryResponse3 || cloudinaryResponse3.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponse3.error || "Unknown Cloudinary Error"
    );
    return next(
      new ErrorHandler("Failed To Upload  Avatar3 To Cloudinary", 500)
    );
  }

  const cloudinaryResponse4 = await cloudinary.uploader.upload(
    image4Avatar.tempFilePath
  );
  if (!cloudinaryResponse4 || cloudinaryResponse4.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponse4.error || "Unknown Cloudinary Error"
    );
    return next(
      new ErrorHandler("Failed To Upload  Avatar4 To Cloudinary", 500)
    );
  }

  const car = new Car({
    make,
    model,
    variant,
    year,
    sellerId: userId,
    displayImg: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
    image2Avatar: {
      public_id: cloudinaryResponse2.public_id,
      url: cloudinaryResponse2.secure_url,
    },
    image3Avatar: {
      public_id: cloudinaryResponse3.public_id,
      url: cloudinaryResponse3.secure_url,
    },
    image4Avatar: {
      public_id: cloudinaryResponse4.public_id,
      url: cloudinaryResponse4.secure_url,
    }
  });

  await car.save();
  res.status(200).json({ message: "Car listed", success: true, car });
});

export const listCar2 = asyncErrorHandler(async (req, res, next) => {
  const user = req.user;
  const userId2 = user._id;

  //const userId2Str = req.user._id.toString();

  const { make, model } = req.query;

  // if (userId !== userId2Str) {
  //   return next(new ErrorHandler("User cannot list the car further", 500));
  // }

  const { price, fuel, transmission, kms, location, owner, color, bodyType } =
    req.body;
  if (
    !price ||
    !fuel ||
    !transmission ||
    !kms ||
    !location ||
    !owner ||
    !color ||
    !bodyType
  ) {
    return next(new ErrorHandler("Fill the credentials", 400));
  }

  const car = await Car.findOneAndUpdate(
    { sellerId: userId2, model: model, make: make },
    {
      price,
      fuel,
      transmission,
      kms,
      location,
      owner,
      color,
      bodyType,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!car) {
    return next(new ErrorHandler("Car not found with the given details", 404));
  }
  res
    .status(200)
    .json({ message: "Car listed2 successfully", success: true, car });
});

export const listCar3 = asyncErrorHandler(async (req, res, next) => {
  const { make, model, location } = req.query;
  const user = req.user;
  const userId = user._id


  const {
    engine,
    mileage,
    seatingCapacity,
    registrationNumber,
    registrationState,
    insuranceValidity,
  } = req.body;

  if (
    !engine ||
    !mileage ||
    !seatingCapacity ||
    !registrationNumber ||
    !registrationState ||
    !insuranceValidity
  ) {
    return next(new ErrorHandler("Fill the credentials", 400));
  }

  const car = await Car.findOneAndUpdate(
    { sellerId: userId, model: model, make: make, location: location },
    {
      engine,
      mileage,
      seatingCapacity,
      registrationNumber,
      registrationState,
      insuranceValidity,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!car) {
    return next(new ErrorHandler("Car not found with the given details", 404));
  }
  res
    .status(200)
    .json({ message: "car listed3 successfully", success: true, car });
});

export const listCar4 = asyncErrorHandler(async (req, res, next) => {
  const { model, location, registrationNumber } = req.query;

  const { length, width, height, groundClearance, bootSpace } = req.body;
  if (!length || !width || !height || !groundClearance || !bootSpace) {
    return next(new ErrorHandler("Fill the credentials", 400));
  }
  const user = req.user
  const userId2 = user._id

  const car = await Car.findOneAndUpdate(
    {
      sellerId: userId2,
      model: model,
      location: location,
      registrationNumber: registrationNumber,
    },
    {
      $set: {
        'specifications.length': length,
        'specifications.width': width,
        'specifications.height': height,
        'specifications.groundClearance': groundClearance,
        'specifications.bootSpace': bootSpace,
        verified: false,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!car) {
    return next(new ErrorHandler("Car not found with the given details", 404));
  }

  res
    .status(200)
    .json({ message: "car4 listed Sccuessfully ", success: true, car });
});





// get Cars
export const getCars = asyncErrorHandler(async (req, res, next) => {
  const cars = await Car.find();
  if (!cars) {
    return next(new ErrorHandler("No cars found", 404));
  }
  res.status(200).json({
    message: "Cars fetched",
    success: true,
    cars,
  });
});




// delete Car
export const deleteCar = asyncErrorHandler(async (req, res, next) => {
  const { carId } = req.params;
  // const user = req.user;
  // const userId = user._id;
  const car = await Car.findById(carId);
  if (!car) {
    return next(new ErrorHandler("Car not found", 404));
  }
  // if (car.sellerId !== userId) {
  //   return next(new ErrorHandler("You are not the owner of this car", 403));
  // }
  await car.deleteOne();
  res.status(200).json({ message: "Car deleted", success: true });
});




// get verified Car
export const getUnverifiedCars = asyncErrorHandler(async (req, res, next) => {
  const cars = await Car.find({ verified: false });
  if (!cars) {
    return next(new ErrorHandler("No cars found", 404));
  }
  res.status(200).json({
    message: "Cars fetched",
    success: true,
    cars,
  });
});





//get unverifyCars
export const getVerifiedCars = asyncErrorHandler(async (req, res, next) => {
  const cars = await Car.find({ verified: true });
  if (!cars) {
    return next(new ErrorHandler("No cars found", 404));
  }
  res.status(200).json({
    message: "Cars fetched",
    success: true,
    cars,
  });
});


//update car verification
export const updateCarVerification = asyncErrorHandler(
  async (req, res, next) => {
    const { carId } = req.params;

    const car = await Car.findByIdAndUpdate(
      carId,
      { verified: true },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Car verified successfully",
      data: car,
    });
  }
);


// get particular car
export const getACar = asyncErrorHandler(async (req, res, next) => {
  const { carId } = req.params;
  const car = await Car.findById(carId);
  if (!car) {
    return next(new ErrorHandler("Car not exist", 400));
  }
  return res.status(200).json({ success: true, message: "Car fetched", car })
})


// get a test drive
export const bookATestDrive = asyncErrorHandler(async (req, res, next) => {
  const { carId } = req.params;
  const user = req.user;
  const userId = user._id;
  const { day, time, name, phone } = req.body;
  if (!day || !time || !name || !phone) {
    return next(new ErrorHandler("Please provide day and time", 400))
  }

  const car = await Car.findById(carId);
  if (!car) {
    return next(new ErrorHandler("Car not found", 400));
  }

  // Check if already booked
  // const alreadyBooked = car.testDrive.some(entry => entry.user.toString() === userId.toString());
  // if (alreadyBooked) {
  //   return next(new ErrorHandler("Test Drive already booked", 400));
  // }

  car.testDrive.push({ user: userId, approved: false, day, time });
  await car.save();

  return res.status(200).json({ success: true, message: "Test Drive booked successfully" });
})


// UnapprovedCar for Test Drive
export const unApprovedCarsForTestDrive = asyncErrorHandler(async (req, res, next) => {
  const cars = await Car.find({
    testDrive: { $elemMatch: { approved: false } }
  }).populate('testDrive.user');
  if (!cars) {
    return next(new ErrorHandler("No car found", 400))
  }
  return res.status(200).json({ success: true, message: "Car found", cars })
})


// approvedCar for Test Drive
export const approvedCarsForTestDrive = asyncErrorHandler(async (req, res, next) => {
  const cars = await Car.find({
    testDrive: { $elemMatch: { approved: true } }
  }).populate('testDrive.user');
  if (!cars) {
    return next(new ErrorHandler("No car found", 400))
  }
  return res.status(200).json({ success: true, message: "Car found", cars })
})


// approve Test Drive 
// export const approveTestDrive = asyncErrorHandler(async (req, res, next) => {

//   const { testDriveId } = req.params;
//   const car = await Car.findOne({testDrive._id: testDriveId});
//   if (!car) {
//     return next(new ErrorHandler("Car not found", 400));
//   }
//   car.testDrive.approved = true;

//   await car.save();

  
//   return res.status(200).json({ success: true, message: "Test Drive approved successfully" })
// })



export const approveTestDrive = asyncErrorHandler(async (req, res, next) => {
  const { testDriveId } = req.params;

  // Find the car where the test drive with this ID exists
  const car = await Car.findOne({ "testDrive._id": testDriveId });

  if (!car) {
    return next(new ErrorHandler("Car not found", 400));
  }

  // Access the testDrive subdocument
  const testDrive = car.testDrive.id(testDriveId);
  if (!testDrive) {
    return next(new ErrorHandler("Test Drive not found", 400));
  }

  // Update approval
  testDrive.approved = true;
  await car.save();

  return res.status(200).json({
    success: true,
    message: "Test Drive approved successfully",
  });
});



// unapprove Test Drive 
export const unApproveTestDrive = asyncErrorHandler(async (req, res, next) => {
  const { testDriveId } = req.params;

  // Find the car where the test drive with this ID exists
  const car = await Car.findOne({ "testDrive._id": testDriveId });

  if (!car) {
    return next(new ErrorHandler("Car not found", 400));
  }

  // Access the testDrive subdocument
  const testDrive = car.testDrive.id(testDriveId);
  if (!testDrive) {
    return next(new ErrorHandler("Test Drive not found", 400));
  }

  // Update approval
  testDrive.approved = false;
  await car.save();

  return res.status(200).json({
    success: true,
    message: "Test Drive revoked successfully",
  });
});