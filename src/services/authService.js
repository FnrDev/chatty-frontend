
import api from './api'

async function signUp(formData){
    const response = await api.post('/auth/sign-up', formData)
    return response.data
}

async function signIn(formData){
    const response = await api.post('/auth/sign-in',formData)
    localStorage.setItem('token', response.data.accessToken);
    return response.data.user
}


async function getCurrentUser(){

    const response = await api.get(
        "/auth/me"
    );


    return response.data;

}

async function updateCurrentUser(formData) {
    const response = await api.patch("/auth/me", formData);
    return response.data;
}



function logout(){

    localStorage.removeItem("token");

}

export {
  signUp,
  signIn,
  getCurrentUser,
  updateCurrentUser,
  logout
};
