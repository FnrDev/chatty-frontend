import api from "./api";

async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post("/upload", formData)

  return response.data
}

export { uploadImage }