'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardBody, CardHeader, Input, Button } from '@heroui/react'
import { Mail, Lock, User } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    
    // 注册用户
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // 如果注册成功，等待一小段时间让触发器创建 profile
    if (authData.user) {
      setTimeout(async () => {
        // 更新用户名
        if (username) {
          try {
            (supabase as any)
              .schema('feature').from('profiles')
              .update({ username: username })
              .eq('id', authData.user!.id)
              .then((result: any) => {
                if (result.error) {
                  console.error('更新用户名失败:', result.error)
                }
              })
          } catch (error) {
            console.error('更新用户名失败:', error)
          }
        }
        router.push('/')
        router.refresh()
      }, 500)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 items-start">
          <h1 className="text-2xl font-bold">注册</h1>
          <p className="text-sm text-default-500">创建你的新账户</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            {error && (
              <div className="bg-danger-50 text-danger p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <Input
              type="text"
              label="用户名"
              placeholder="输入用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              startContent={<User size={18} />}
              required
            />
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
              placeholder="至少6个字符"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              startContent={<Lock size={18} />}
              required
              minLength={6}
            />
            <Button
              type="submit"
              color="primary"
              isLoading={loading}
              className="w-full"
            >
              注册
            </Button>
            <p className="text-center text-sm text-default-500">
              已有账户？{' '}
              <Link href="/auth/login" className="text-primary hover:underline">
                立即登录
              </Link>
            </p>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}

