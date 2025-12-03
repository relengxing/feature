import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardBody, CardHeader } from '@heroui/react'
import { Users, FileText, MessageCircle, TrendingUp, Shield, ArrowLeft, ThumbsUp } from 'lucide-react'
import type { Profile } from '@/types/database.types'
import Link from 'next/link'

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
      gradient: 'from-blue-500 to-cyan-400',
      bgGradient: 'from-blue-500/10 to-cyan-400/10',
      iconColor: 'text-blue-500',
    },
    {
      title: '总想法数',
      value: totalIdeas || 0,
      icon: FileText,
      gradient: 'from-green-500 to-emerald-400',
      bgGradient: 'from-green-500/10 to-emerald-400/10',
      iconColor: 'text-green-500',
    },
    {
      title: '总评论数',
      value: totalComments || 0,
      icon: MessageCircle,
      gradient: 'from-purple-500 to-pink-400',
      bgGradient: 'from-purple-500/10 to-pink-400/10',
      iconColor: 'text-purple-500',
    },
    {
      title: '总投票数',
      value: totalVotes || 0,
      icon: TrendingUp,
      gradient: 'from-accent-primary to-accent-tertiary',
      bgGradient: 'from-accent-primary/10 to-accent-tertiary/10',
      iconColor: 'text-accent-primary',
    },
  ]

  return (
    <div className="min-h-screen py-8">
      {/* 装饰背景 */}
      <div className="fixed inset-0 hero-pattern grid-pattern opacity-30 pointer-events-none"></div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* 返回按钮 */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-default-500 hover:text-accent-primary mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          返回首页
        </Link>

        {/* 页面标题 */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-tertiary flex items-center justify-center shadow-glow-accent">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">管理面板</h1>
            <p className="text-default-500 text-sm">查看和管理平台数据</p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card 
              key={stat.title}
              className="bg-background/70 backdrop-blur-xl border border-default-200/50 shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-default-500 mb-1">{stat.title}</p>
                    <p className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.bgGradient}`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* 最近的想法和用户 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 最近的想法 */}
          <Card className="bg-background/70 backdrop-blur-xl border border-default-200/50 shadow-soft animate-fade-in-up delay-200">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-400/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-500" />
                </div>
                <h2 className="text-xl font-bold">最近的想法</h2>
              </div>
            </CardHeader>
            <CardBody className="p-6 pt-0">
              {recentIdeas && recentIdeas.length > 0 ? (
                <div className="space-y-3">
                  {recentIdeas.map((idea: any) => (
                    <div 
                      key={idea.id} 
                      className="p-3 rounded-xl hover:bg-default-100/50 transition-colors border-b border-default-100 last:border-b-0"
                    >
                      <Link
                        href={`/ideas/${idea.id}`}
                        className="font-medium hover:text-accent-primary line-clamp-1 transition-colors"
                      >
                        {idea.title}
                      </Link>
                      <div className="flex items-center gap-3 text-xs text-default-500 mt-1.5">
                        <span className="font-medium">{idea.author_username || '匿名用户'}</span>
                        <span className="text-default-300">·</span>
                        <span>{new Date(idea.created_at).toLocaleDateString('zh-CN')}</span>
                        <span className="text-default-300">·</span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" /> {idea.upvotes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" /> {idea.comment_count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-default-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>暂无数据</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* 最近的用户 */}
          <Card className="bg-background/70 backdrop-blur-xl border border-default-200/50 shadow-soft animate-fade-in-up delay-300">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-400/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="text-xl font-bold">最近注册的用户</h2>
              </div>
            </CardHeader>
            <CardBody className="p-6 pt-0">
              {recentUsers && recentUsers.length > 0 ? (
                <div className="space-y-3">
                  {recentUsers.map((u: any) => (
                    <div 
                      key={u.id} 
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-default-100/50 transition-colors border-b border-default-100 last:border-b-0"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-primary/20 to-accent-tertiary/20 flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-accent-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{u.username || '未设置用户名'}</p>
                        <p className="text-xs text-default-500">
                          {new Date(u.created_at).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                      {u.role === 'super_admin' && (
                        <span className="text-xs bg-accent-primary/10 text-accent-primary px-2.5 py-1 rounded-full font-medium border border-accent-primary/20">
                          管理员
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-default-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>暂无数据</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
