'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardBody, CardHeader, Input, Button } from '@heroui/react'
import { Mail, Lock, Sparkles, ArrowRight } from 'lucide-react'
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
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* 装饰背景 */}
      <div className="absolute inset-0 hero-pattern grid-pattern opacity-50"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent-primary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-tertiary/10 rounded-full blur-3xl animate-float delay-500"></div>
      
      <Card className="w-full max-w-md relative z-10 bg-background/70 backdrop-blur-xl border border-default-200/50 shadow-medium animate-scale-in">
        <CardHeader className="flex flex-col gap-3 items-center pt-8 pb-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-tertiary flex items-center justify-center shadow-glow-accent animate-pulse-glow">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold gradient-text">欢迎回来</h1>
            <p className="text-sm text-default-500 mt-1">登录你的账户，继续探索</p>
          </div>
        </CardHeader>

        <CardBody className="px-6 pb-8">
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {error && (
              <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl text-sm animate-fade-in-up">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <Input
              type="email"
              label="邮箱地址"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              startContent={<Mail size={18} className="text-default-400" />}
              classNames={{
                inputWrapper: "bg-default-100/50 border border-default-200 hover:border-accent-primary/50 focus-within:border-accent-primary data-[hover=true]:bg-default-100/70",
                label: "text-default-600",
              }}
              required
            />

            <Input
              type="password"
              label="密码"
              placeholder="输入你的密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              startContent={<Lock size={18} className="text-default-400" />}
              classNames={{
                inputWrapper: "bg-default-100/50 border border-default-200 hover:border-accent-primary/50 focus-within:border-accent-primary data-[hover=true]:bg-default-100/70",
                label: "text-default-600",
              }}
              required
            />

            <Button
              type="submit"
              isLoading={loading}
              className="w-full btn-gradient text-white font-semibold h-12 mt-2"
              endContent={!loading && <ArrowRight className="w-4 h-4" />}
            >
              {loading ? '登录中...' : '登录'}
            </Button>

            <div className="relative my-2">
              <div className="divider-gradient"></div>
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-xs text-default-400">
                或者
              </span>
            </div>

            <p className="text-center text-sm text-default-500">
              还没有账户？{' '}
              <Link 
                href="/auth/signup" 
                className="text-accent-primary font-semibold hover:underline inline-flex items-center gap-1 group"
              >
                立即注册
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
