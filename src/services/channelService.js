import api from "./api";

async function getChannels() {
    try {
       const response = await api.get("/channels")
       return response
    } catch(err) {
        console.log(err)
    }
}

export {
  getChannels
};
