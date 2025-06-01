import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../config/FirebaseConfig";

const uploadFileApi = {
  async uploadFile(e) {
    try {
      console.log("Upload event:", e);
      console.log("Upload target:", e.target);
      
      // Kiểm tra xem có file được chọn không
      if (!e.target || !e.target.files || e.target.files.length === 0) {
        console.error("No file selected");
        throw new Error("Vui lòng chọn một file ảnh");
      }
      
      const file = e.target.files[0];
      console.log("File to upload:", file);
      
      // Kiểm tra loại file
      if (!file.type.startsWith('image/')) {
        throw new Error("Chỉ chấp nhận file ảnh");
      }
      
      // Tạo tên file duy nhất
      const name = `${new Date().getTime()}_${file.name.replace(/\s+/g, '_')}`;
      console.log("File name in storage:", name);
      
      // Tạo reference đến storage
      const storageRef = ref(storage, name);
      
      // Bắt đầu upload
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Tạo một Promise để xử lý việc trả về downloadURL
      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Upload is running");
                break;
              default:
                break;
            }
          },
          (error) => {
            console.error("Upload error:", error);
            reject(error); // Trả về lỗi nếu có lỗi xảy ra
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref)
              .then((downloadURL) => {
                console.log("Download URL:", downloadURL);
                // Khi upload thành công, resolve Promise với downloadURL
                resolve(downloadURL);
              })
              .catch((error) => {
                console.error("Error getting download URL:", error);
                reject(error);
              });
          }
        );
      });
    } catch (error) {
      console.error("Error in uploadFile:", error);
      throw error;
    }
  },
};

export default uploadFileApi;
