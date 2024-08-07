import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'; // file system is used to read, write the file. 
// The Node.js file system module allows you to work with the file system on your computer.

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        // Upload the file to the cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // File is successfully uploaded.
        console.log("File is successfully uploaded.", response.url)
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        console.log('Error while uploading the file to cloudinary: ' + JSON.stringify(error.error))
        fs.unlinkSync(localFilePath)
        // remove the locally saved temporary file as the upload operation got failed.
        return null
    }
}

const deleteOnCloudinary = async (url, resourceType) => {
    // Split the URL by '/'
    const parts = url.split('/');

    // Get the second-to-last part which contains the ID
    const idWithExtension = parts[parts.length - 1];

    // Remove the file extension '.jpg' to get the ID only
    const id = idWithExtension.split('.')[0] + '.csv';

    try {
        if (!id) return null;
        const response = await cloudinary.api.delete_resources([id], {"resource_type": resourceType});
        return response
    } catch (error) {
        console.log('Error while deleting the file from cloudinary: ' + JSON.stringify(error.error))
        return null;
    }
}

export {uploadOnCloudinary, deleteOnCloudinary}