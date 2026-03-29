"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"
import axios from "axios"
import toast from "react-hot-toast"


function VerifyEmailContent() {
    const searchParams = useSearchParams()
    const secret = searchParams.get("secret")
    const email = searchParams.get("email")
    const router = useRouter()

    useEffect(() => {
        if (!secret || !email) return;

        async function handleVerifyEmail() {
            try {
                const res = await axios.get(`/api/verifyEmail?email=${email}&secret=${secret}`)
                if (res.data.success) {
                    toast.success(res.data.message)
                    router.push("/login")
                    return
                }
                toast.error(res.data.message)
                router.push("/login")
                return
            } catch (error) {
                toast.error("Error occure in verifing user | try again")
                router.push("/login")
                return
            }
        }
        handleVerifyEmail()
    }, [secret, email, router])

    if (!secret || !email) {
        return (
            <div>
                <h1>Invalid verification link</h1>
            </div>
        )
    }

    return (
        <div>
            <h1>Verify</h1>
        </div>
    )
}

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    )
}