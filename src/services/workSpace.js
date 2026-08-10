import api from "./api";

async function getWorkSpaceData(id) {
    try {
        const response = await api.get(`/workspaces/${id}`)
        return response
    } catch(err) {
        return err
    }
}

export {
  getWorkSpaceData
};
