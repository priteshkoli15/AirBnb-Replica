const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key : process.env.CLOUD_API_KEY,
    api_secret : process.env.CLOUD_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'wanderlust_DEV',
      allowedFormats : ["png", "jpg" , "jpeg"],
    },
  });

  module.exports = {
    cloudinary ,
     storage,
  }


  //path is : https://console.cloudinary.com/app/c-e0c2343647b9b964dd2bfa01857de1/assets/media_library/folders/ce9c3a523a0967dd4a3147c8a3e8ac5387?view_mode=mosaic