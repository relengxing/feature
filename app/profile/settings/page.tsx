'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardBody, CardHeader, Input, Button, Avatar, Spinner } from '@heroui/react'
import { User, Image as ImageIcon, Settings, Save, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [username, setUsername] = useState('')
  const [avatar, setAvatar] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .schema('feature').from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        const profileData = profile as any
        setUsername(profileData.username || '')
        setAvatar(profileData.avatar || '')
      }

      setLoading(false)
    }

    loadProfile()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('未登录')
      setSaving(false)
      return
    }

    const { error: updateError } = await (supabase as any)
      .schema('feature').from('profiles')
      .update({
        username,
        avatar,
      })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess('个人资料已更新')
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 1000)
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[50vh] gap-3">
        <Spinner size="lg" color="primary" />
        <p className="text-default-500">加载中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      {/* 装饰背景 */}
      <div className="fixed inset-0 hero-pattern grid-pattern opacity-30 pointer-events-none"></div>

      <div className="container mx-auto px-4 max-w-2xl relative z-10">
        {/* 返回按钮 */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-default-500 hover:text-accent-primary mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          返回首页
        </Link>

        {/* 页面标题 */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-tertiary mb-4 shadow-glow-accent">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">个人设置</h1>
          <p className="text-default-500">管理你的个人资料</p>
        </div>

        <Card className="bg-background/70 backdrop-blur-xl border border-default-200/50 shadow-medium animate-scale-in">
          <CardBody className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl text-sm animate-fade-in-up">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⚠️</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}
              {success && (
                <div className="bg-success/10 border border-success/20 text-success p-4 rounded-xl text-sm animate-fade-in-up">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✅</span>
                    <span>{success}</span>
                  </div>
                </div>
              )}

              {/* 头像预览和设置 */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-default-50/50 border border-default-200">
                <div className="relative">
                  <Avatar 
                    src={avatar || undefined} 
                    name={username || '用户'} 
                    className="w-24 h-24 text-2xl ring-4 ring-offset-4 ring-offset-background ring-accent-primary/30"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success border-3 border-background"></div>
                </div>
                <div className="flex-1 w-full">
                  <label className="text-sm font-medium text-default-600 mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-accent-primary" />
                    头像 URL
                  </label>
                  <Input
                    placeholder="https://example.com/avatar.jpg"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    classNames={{
                      inputWrapper: "bg-background border border-default-200 hover:border-accent-primary/50 focus-within:border-accent-primary data-[hover=true]:bg-background",
                    }}
                  />
                  <p className="text-xs text-default-400 mt-2">输入图片链接以更换头像</p>
                </div>
              </div>

              {/* 用户名 */}
              <div>
                <label className="text-sm font-medium text-default-600 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-accent-primary" />
                  用户名
                </label>
                <Input
                  placeholder="输入你的用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  classNames={{
                    inputWrapper: "bg-default-100/50 border border-default-200 hover:border-accent-primary/50 focus-within:border-accent-primary data-[hover=true]:bg-default-100/70",
                  }}
                />
                <p className="text-xs text-default-400 mt-2">这是你在社区中显示的名称</p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="flat" 
                  onClick={() => router.back()}
                  className="font-medium"
                >
                  取消
                </Button>
                <Button 
                  type="submit" 
                  isLoading={saving}
                  className="btn-gradient font-semibold"
                  endContent={!saving && <Save className="w-4 h-4" />}
                >
                  {saving ? '保存中...' : '保存更改'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
