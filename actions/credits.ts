'use server'

import axios from "axios"
import { findUserById } from "./auth-actions"

export async function getCompanyBalalnce(userid: string){
    try{
    const results = await findUserById(userid)
        if(!results || !results.companyId){
            return {message: "No Company Id"}
        }
  const res = await axios.get(`${process.env.DEEPTRACK_BACKEND_URL}/v1/credits/balance/${results.companyId}`)

  return res.data
    } catch(error){
console.log(error)
return{message: error}
    }
}

export async function getCompanyVerifications(userid: string){
    try {
        const results = await findUserById(userid)
        if(!results || !results.companyId){
            return {message: "No Company Id"}
        }
        const res = await axios.get(`${process.env.DEEPTRACK_BACKEND_URL}/v1/credits/verifications/${results.companyId}`)
        console.log(res.data)
        return res.data
    } catch (error) {
    console.log(error)
    return{message: error} 
    }
}