'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Textarea,
  Button,
  Select,
  SelectItem,
  Tabs,
  Tab,
  Spinner,
} from '@heroui/react'
import { createClient } from '@/lib/supabase/client'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { STATUS_LABELS } from '@/lib/utils'
import type { IdeaStatus, IdeaVisibility } from '@/types/database.types'

export default function EditIdeaPage() {
  const router = useRouter()
  const params = useParams()
  const ideaId = params.id as string

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<IdeaStatus>('planning')
  const [visibility, setVisibility] = useState<IdeaVisibility>('public')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')

  useEffect(() => {
    const loadIdea = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: idea, error: fetchError } = await supabase
        .schema('feature').from('ideas')
        .select('*')
        .eq('id', ideaId)
        .single()

      if (fetchError || !idea) {
        setError('无法加载想法')
        setLoading(false)
        return
      }

      if ((idea as any).user_id !== user.id) {
        setError('你没有权限编辑这个想法')
        setLoading(false)
        return
      }

      setTitle((idea as any).title)
      setContent((idea as any).content)
      setStatus((idea as any).status)
      setVisibility((idea as any).visibility)
      setLoading(false)
    }

    loadIdea()
  }, [ideaId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    const supabase = createClient()

    const { error: updateError } = await (supabase as any)
      .schema('feature').from('ideas')
      .update({
        title,
        content,
        status,
        visibility,
      })
      .eq('id', ideaId)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
    } else {
      router.push(`/ideas/${ideaId}`)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error && !title) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-danger-50 text-danger p-4 rounded-lg">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">编辑想法</h1>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-danger-50 text-danger p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="标题"
              placeholder="给你的想法起个标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              size="lg"
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">内容（支持 Markdown）</label>
              <Tabs
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as 'edit' | 'preview')}
              >
                <Tab key="edit" title="编辑">
                  <Textarea
                    placeholder="描述你的想法... 支持 Markdown 格式"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    minRows={10}
                    maxRows={20}
                  />
                </Tab>
                <Tab key="preview" title="预览">
                  <div className="border rounded-lg p-4 min-h-[300px]">
                    {content ? (
                      <MarkdownRenderer content={content} />
                    ) : (
                      <p className="text-default-400">暂无内容</p>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="状态"
                selectedKeys={[status]}
                onChange={(e) => setStatus(e.target.value as IdeaStatus)}
                required
              >
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key}>
                    {label}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="可见性"
                selectedKeys={[visibility]}
                onChange={(e) => setVisibility(e.target.value as IdeaVisibility)}
                required
              >
                <SelectItem key="public">
                  所有人可见
                </SelectItem>
                <SelectItem key="private">
                  仅自己可见
                </SelectItem>
              </Select>
            </div>

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

