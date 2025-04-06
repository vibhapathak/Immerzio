// a wraper for axios, a library would be used ...1:20
import axios from "axios"
import { HOST } from "@/utils/constants"

export const apiClient = axios.create({
    baseURL: HOST,
    withCredentials: true,
   
});

