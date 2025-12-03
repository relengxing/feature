'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardBody, CardHeader, Input, Button } from '@heroui/react'
import { Mail, Lock } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(redirect)
      router.refresh()
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 items-start">
          <h1 className="text-2xl font-bold">登录</h1>
          <p className="text-sm text-default-500">登录到你的账户</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {error && (
              <div className="bg-danger-50 text-danger p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <Input
              type="email"
              label="邮箱"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              startContent={<Mail size={18} />}
              required
            />
            <Input
              type="password"
              label="密码"
              placeholder="输入你的密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              startContent={<Lock size={18} />}
              required
            />
            <Button
              type="submit"
              color="primary"
              isLoading={loading}
              className="w-full"
            >
              登录
            </Button>
            <p className="text-center text-sm text-default-500">
              还没有账户？{' '}
              <Link href="/auth/signup" className="text-primary hover:underline">
                立即注册
              </Link>
            </p>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}

