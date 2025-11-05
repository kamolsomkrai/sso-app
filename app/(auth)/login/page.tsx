"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

const formSchema = z.object({
  username: z.string().min(4, {
    message: "Username must be at least 4 characters.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
})

type FormValues = z.infer<typeof formSchema>

// Enum สำหรับ Provider IDs เพื่อป้องกัน typo
const AuthProvider = {
  CREDENTIALS: "credentials",
  HEALTH_ID: "healthid",
  PROVIDER_ID: "provider-id",
} as const

type AuthProviderType = typeof AuthProvider[keyof typeof AuthProvider]

const LoginPage = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [ssoLoading, setSsoLoading] = useState<AuthProviderType | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  // 1. Handler สำหรับ Username/Password (Credentials)
  const onSubmit = async (values: FormValues): Promise<void> => {
    setIsLoading(true)

    try {
      const result = await signIn(AuthProvider.CREDENTIALS, {
        username: values.username,
        password: values.password,
        redirect: false,
      })

      if (result?.error) {
        console.error("Login failed:", result.error)
        // คุณสามารถเพิ่มการแสดง error ต่อผู้ใช้ที่นี่
      } else if (result?.ok) {
        router.push("/dashboard") // หรือหน้า destination หลังจาก login สำเร็จ
      }
    } catch (error) {
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 2. Handler สำหรับ SSO Providers
  const handleSsoLogin = async (providerId: AuthProviderType): Promise<void> => {
    setSsoLoading(providerId)

    try {
      await signIn(providerId, {
        callbackUrl: "/dashboard", // กำหนดหน้าที่จะไปหลังจาก login สำเร็จ
      })
    } catch (error) {
      console.error(`SSO login failed for ${providerId}:`, error)
      setSsoLoading(null)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-8 border rounded-lg shadow-lg">
      {/* ส่วนของฟอร์ม Username/Password */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    placeholder="shadcn"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="********"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Submit"}
          </Button>
        </form>
      </Form>

      {/* ส่วนของ SSO ที่เพิ่มเข้ามา */}
      <div className="relative my-6">
        <Separator />
        <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-background px-2 text-sm text-muted-foreground">
          OR CONTINUE WITH
        </span>
      </div>

      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleSsoLogin(AuthProvider.HEALTH_ID)}
          disabled={ssoLoading !== null}
        >
          {ssoLoading === AuthProvider.HEALTH_ID ? (
            "Redirecting to HealthID..."
          ) : (
            "Log in with HealthID"
          )}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleSsoLogin(AuthProvider.PROVIDER_ID)}
          disabled={ssoLoading !== null}
        >
          {ssoLoading === AuthProvider.PROVIDER_ID ? (
            "Redirecting to Provider ID..."
          ) : (
            "Log in with Provider ID"
          )}
        </Button>
      </div>
    </div>
  )
}

export default LoginPage