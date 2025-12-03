import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database.types'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 重要：必须先调用 supabase.auth.getUser() 来刷新会话
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 如果访问 /admin 路由，检查用户是否是超级管理员
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      // 未登录，重定向到登录页
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    // 获取用户角色
    const { data: profile } = await supabase
      .schema('feature').from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile || (profile as any).role !== 'super_admin') {
      // 不是超级管理员，重定向到首页
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

