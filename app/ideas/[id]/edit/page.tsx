'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Card,
  CardBody,
  Input,
  Textarea,
  Button,
  Select,
  SelectItem,
  Spinner,
} from '@heroui/react'
import { createClient } from '@/lib/supabase/client'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { STATUS_LABELS } from '@/lib/utils'
import type { IdeaStatus, IdeaVisibility } from '@/types/database.types'
import { Edit3, Save, Eye, FileText, ArrowLeft, Sparkles, Tag } from 'lucide-react'
import Link from 'next/link'

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
      <div className="flex flex-col justify-center items-center min-h-[50vh] gap-3">
        <Spinner size="lg" color="primary" />
        <p className="text-default-500">加载中...</p>
      </div>
    )
  }

  if (error && !title) {
    return (
      <div className="min-h-screen py-8">
        <div className="fixed inset-0 hero-pattern grid-pattern opacity-30 pointer-events-none"></div>
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-default-500 hover:text-accent-primary mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            返回首页
          </Link>
          <div className="bg-danger/10 border border-danger/20 text-danger p-6 rounded-xl animate-fade-in-up">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      {/* 装饰背景 */}
      <div className="fixed inset-0 hero-pattern grid-pattern opacity-30 pointer-events-none"></div>
      
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        {/* 返回按钮 */}
        <Link 
          href={`/ideas/${ideaId}`}
          className="inline-flex items-center gap-2 text-default-500 hover:text-accent-primary mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          返回想法详情
        </Link>

        {/* 页面标题 */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-tertiary mb-4 shadow-glow-accent">
            <Edit3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">编辑想法</h1>
          <p className="text-default-500">修改并更新你的想法</p>
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

              {/* 标题输入 */}
              <div>
                <label className="text-sm font-medium text-default-600 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent-primary" />
                  想法标题
                </label>
                <Input
                  placeholder="给你的想法起一个吸引人的标题"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  size="lg"
                  classNames={{
                    inputWrapper: "bg-default-100/50 border border-default-200 hover:border-accent-primary/50 focus-within:border-accent-primary data-[hover=true]:bg-default-100/70",
                  }}
                />
              </div>

              {/* 内容编辑 */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-default-600 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-accent-primary" />
                  内容描述（支持 Markdown）
                </label>
                
                {/* 自定义 Tab 按钮 */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('edit')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeTab === 'edit'
                        ? 'bg-gradient-to-r from-accent-primary to-[#ff8c5a] text-white shadow-md'
                        : 'bg-default-100/50 text-default-600 hover:bg-default-200/50'
                    }`}
                  >
                    ✏️ 编辑
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeTab === 'preview'
                        ? 'bg-gradient-to-r from-accent-primary to-[#ff8c5a] text-white shadow-md'
                        : 'bg-default-100/50 text-default-600 hover:bg-default-200/50'
                    }`}
                  >
                    👁️ 预览
                  </button>
                </div>

                {/* 编辑/预览内容 */}
                {activeTab === 'edit' ? (
                  <Textarea
                    placeholder="详细描述你的想法... 支持 Markdown 格式"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    minRows={12}
                    maxRows={24}
                    classNames={{
                      base: "focus-within:ring-0",
                      inputWrapper: "bg-default-100/50 border border-default-200 hover:border-accent-primary/50 focus-within:border-accent-primary focus-within:ring-0 shadow-none",
                      input: "focus:ring-0 focus:outline-none",
                    }}
                  />
                ) : (
                  <div className="border border-default-200 rounded-xl p-6 min-h-[300px] bg-background/50">
                    {content ? (
                      <MarkdownRenderer content={content} />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-default-400 py-12">
                        <Eye className="w-12 h-12 mb-3 opacity-50" />
                        <p>开始编辑以预览内容</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 状态和可见性 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-default-600 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-accent-primary" />
                    状态
                  </label>
                  <Select
                    placeholder="选择状态"
                    selectedKeys={[status]}
                    onChange={(e) => setStatus(e.target.value as IdeaStatus)}
                    required
                    classNames={{
                      trigger: "bg-default-100/50 border border-default-200 hover:border-accent-primary/50 data-[hover=true]:bg-default-100/70",
                      innerWrapper: "flex flex-row-reverse",
                      selectorIcon: "relative right-0 ml-2",
                      value: "text-left",
                      popoverContent: "bg-background border border-default-200 shadow-lg",
                    }}
                    listboxProps={{
                      itemClasses: {
                        base: "data-[selectable=true]:focus:bg-default-100",
                        selectedIcon: "hidden",
                      },
                    }}
                  >
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                      <SelectItem key={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-default-600 mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-accent-primary" />
                    可见性
                  </label>
                  <Select
                    placeholder="选择可见性"
                    selectedKeys={[visibility]}
                    onChange={(e) => setVisibility(e.target.value as IdeaVisibility)}
                    required
                    classNames={{
                      trigger: "bg-default-100/50 border border-default-200 hover:border-accent-primary/50 data-[hover=true]:bg-default-100/70",
                      innerWrapper: "flex flex-row-reverse",
                      selectorIcon: "relative right-0 ml-2",
                      value: "text-left",
                      popoverContent: "bg-background border border-default-200 shadow-lg",
                    }}
                    listboxProps={{
                      itemClasses: {
                        base: "data-[selectable=true]:focus:bg-default-100",
                        selectedIcon: "hidden",
                      },
                    }}
                  >
                    <SelectItem key="public">
                      所有人可见
                    </SelectItem>
                    <SelectItem key="private">
                      仅自己可见
                    </SelectItem>
                  </Select>
                </div>
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
