import { OpenAPI } from "./client";

OpenAPI.interceptors.request.use((req)=>{
    if(req.url?.startsWith("/api/v1") && req.withCredentials === true){
        console.log("Hehe")
        req.headers = {
            ...req.headers,
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    }
    return req
})

export default OpenAPI