import { getCompanyBalalnce, getCompanyVerifications } from "@/actions/credits";
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Billing from "./_components/billing";

export default async function page() {

  const user = await currentUser()
  if(!user || !user.id){
    redirect('/new-user')
  }
  
  const balance = await getCompanyBalalnce(user.id)

  const verifications = await getCompanyVerifications(user.id)
  
  return (
			<div className="p-4">
				<Billing verifications={verifications} balance={balance} />
			</div>
		);
}


