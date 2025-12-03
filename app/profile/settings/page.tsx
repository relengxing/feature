'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardBody, CardHeader, Input, Button, Avatar, Spinner } from '@heroui/react'
import { User, Image as ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

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
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">个人设置</h1>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-danger-50 text-danger p-3 rounded-lg text-sm">{error}</div>
            )}
            {success && (
              <div className="bg-success-50 text-success p-3 rounded-lg text-sm">{success}</div>
            )}

            <div className="flex items-center gap-4">
              <Avatar src={avatar || undefined} name={username} size="lg" />
              <div className="flex-1">
                <Input
                  label="头像 URL"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  startContent={<ImageIcon size={18} />}
                />
              </div>
            </div>

            <Input
              label="用户名"
              placeholder="输入你的用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              startContent={<User size={18} />}
              required
            />

            <div className="flex justify-end gap-2">
              <Button variant="flat" onClick={() => router.back()}>
                取消
              </Button>
              <Button type="submit" color="primary" isLoading={saving}>
                保存更改
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}

