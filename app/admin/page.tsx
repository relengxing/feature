import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardBody, CardHeader } from '@heroui/react'
import { Users, FileText, MessageCircle, TrendingUp } from 'lucide-react'
import type { Profile } from '@/types/database.types'

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .schema('feature').from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || (profile as Pick<Profile, 'role'>).role !== 'super_admin') {
    redirect('/')
  }

  // 获取统计数据
  const { count: totalUsers } = await supabase
    .schema('feature').from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: totalIdeas } = await supabase
    .schema('feature').from('ideas')
    .select('*', { count: 'exact', head: true })

  const { count: totalComments } = await supabase
    .schema('feature').from('comments')
    .select('*', { count: 'exact', head: true })

  const { count: totalVotes } = await supabase
    .schema('feature').from('idea_votes')
    .select('*', { count: 'exact', head: true })

  // 获取最近的想法
  const { data: recentIdeas } = await supabase
    .schema('feature').from('ideas_with_stats')
    .select('id, title, author_username, created_at, upvotes, comment_count')
    .order('created_at', { ascending: false })
    .limit(10)

  // 获取最近的用户
  const { data: recentUsers } = await supabase
    .schema('feature').from('profiles')
    .select('id, username, role, created_at')
    .order('created_at', { ascending: false })
    .limit(10)

  const stats = [
    {
      title: '总用户数',
      value: totalUsers || 0,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: '总想法数',
      value: totalIdeas || 0,
      icon: FileText,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: '总评论数',
      value: totalComments || 0,
      icon: MessageCircle,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: '总投票数',
      value: totalVotes || 0,
      icon: TrendingUp,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">超级管理员面板</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={stat.color} size={24} />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* 最近的想法和用户 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近的想法 */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">最近的想法</h2>
          </CardHeader>
          <CardBody>
            {recentIdeas && recentIdeas.length > 0 ? (
              <div className="space-y-3">
                {recentIdeas.map((idea: any) => (
                  <div key={idea.id} className="border-b pb-3 last:border-b-0">
                    <a
                      href={`/ideas/${idea.id}`}
                      className="font-medium hover:text-primary line-clamp-1"
                    >
                      {idea.title}
                    </a>
                    <div className="flex items-center gap-2 text-xs text-default-500 mt-1">
                      <span>{idea.author_username || '匿名用户'}</span>
                      <span>·</span>
                      <span>{new Date(idea.created_at).toLocaleDateString('zh-CN')}</span>
                      <span>·</span>
                      <span>
                        👍 {idea.upvotes} · 💬 {idea.comment_count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-default-500">暂无数据</p>
            )}
          </CardBody>
        </Card>

        {/* 最近的用户 */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">最近注册的用户</h2>
          </CardHeader>
          <CardBody>
            {recentUsers && recentUsers.length > 0 ? (
              <div className="space-y-3">
                {recentUsers.map((user: any) => (
                  <div key={user.id} className="border-b pb-3 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{user.username || '未设置用户名'}</p>
                        <p className="text-xs text-default-500">
                          {new Date(user.created_at).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                      {user.role === 'super_admin' && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                          管理员
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-default-500">暂无数据</p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

