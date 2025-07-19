import multer from 'multer';

const upload=multer({storage:multer.diskStorage({})})
//  to use disk storage for handling file uploads 


export default upload
