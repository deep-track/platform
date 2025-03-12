import { getCompanyBalalnce, getCompanyVerifications } from "@/actions/credits"
import Billing from "./_components/billing"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function page() {

  const user = await currentUser()
  if(!user || !user.id){
    redirect('/new-user')
  }
  
  const balance = await getCompanyBalalnce(user.id)

  const verifications = await getCompanyVerifications(user.id)
  
  return (
   <Billing verifications={verifications} balance={balance} />
  )
}


