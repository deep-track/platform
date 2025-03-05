import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import VerifyIdentityForm from './verify-id-form'
  
export default function IdentityDialog() {
  return (
    <Dialog>
    <DialogTrigger className="bg-white hover:bg-customTeal text-black px-4 py-2 rounded-md font-semibold" >
     VERIFY IDENTITY

    </DialogTrigger>
    <DialogContent className='w-full'>
      <DialogHeader>
        <DialogTitle>Identity Veriication</DialogTitle>
        <DialogDescription>
         Follow the steps below to verify a users identity
        </DialogDescription>
      </DialogHeader>
      <VerifyIdentityForm  />
    </DialogContent>
  </Dialog>
  
  )
}
