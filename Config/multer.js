const multer = require('multer')

const FILE_TYPE_MAP = {
  "image/png":"png",
    "image/jpeg":"jpeg",
    "image/jpg":"jpg",
    "image/webp":"webp"
}

const storage = multer.diskStorage({
  destination:function(req,file,cb){
    const isValid = FILE_TYPE_MAP[file.mimetype]
    let uploadError = new Error("inavalid image type");
        if(isValid){
            uploadError = null;
        }
        cb(uploadError,'../SnapShot-server/Public/Images')
  },
  filename:(req,file,cb)=>{
    cb(null,`${Date.now()}-${file.originalname}`)
  }
})

const uploadOptions = multer({storage:storage})

module.exports = {uploadOptions};