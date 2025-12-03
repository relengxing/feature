'use client'

import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from '@heroui/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { User, LogOut, Settings, PlusCircle, Home, Shield } from 'lucide-react'
import type { Profile } from '@/types/database.types'
import { createClient } from '@/lib/supabase/client'

interface NavbarProps {
  user: { id: string; email?: string } | null
  profile: Profile | null
}

export function Navbar({ user, profile }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const menuItems = [
    { name: '首页', href: '/', icon: Home },
    ...(user ? [{ name: '发布想法', href: '/ideas/new', icon: PlusCircle }] : []),
    ...(profile?.role === 'super_admin' ? [{ name: '管理面板', href: '/admin', icon: Shield }] : []),
  ]

  return (
    <HeroNavbar maxWidth="xl" isBordered>
      <NavbarContent>
        <NavbarMenuToggle className="sm:hidden" />
        <NavbarBrand>
          <Link href="/" className="font-bold text-xl">
            想法记录
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem isActive={pathname === '/'}>
          <Link href="/" className="flex items-center gap-2">
            <Home size={18} />
            首页
          </Link>
        </NavbarItem>
        {user && (
          <NavbarItem isActive={pathname === '/ideas/new'}>
            <Link href="/ideas/new" className="flex items-center gap-2">
              <PlusCircle size={18} />
              发布想法
            </Link>
          </NavbarItem>
        )}
        {profile?.role === 'super_admin' && (
          <NavbarItem isActive={pathname.startsWith('/admin')}>
            <Link href="/admin" className="flex items-center gap-2">
              <Shield size={18} />
              管理面板
            </Link>
          </NavbarItem>
        )}
      </NavbarContent>

      <NavbarContent justify="end">
        {user ? (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                src={profile?.avatar || undefined}
                name={profile?.username || user.email || 'User'}
                size="sm"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="用户菜单" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2" textValue="用户信息">
                <p className="font-semibold">登录为</p>
                <p className="font-semibold">{profile?.username || user.email}</p>
              </DropdownItem>
              <DropdownItem
                key="my-ideas"
                startContent={<User size={18} />}
                as={Link}
                href="/profile/ideas"
              >
                我的想法
              </DropdownItem>
              <DropdownItem
                key="settings"
                startContent={<Settings size={18} />}
                as={Link}
                href="/profile/settings"
              >
                个人设置
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                startContent={<LogOut size={18} />}
                onClick={handleSignOut}
              >
                退出登录
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <>
            <NavbarItem className="hidden sm:flex">
              <Button as={Link} href="/auth/login" variant="flat">
                登录
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button as={Link} href="/auth/signup" color="primary">
                注册
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item) => (
          <NavbarMenuItem key={item.href} isActive={pathname === item.href}>
            <Link href={item.href} className="w-full flex items-center gap-2">
              <item.icon size={18} />
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
        {user && (
          <>
            <NavbarMenuItem>
              <Link href="/profile/ideas" className="w-full flex items-center gap-2">
                <User size={18} />
                我的想法
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link href="/profile/settings" className="w-full flex items-center gap-2">
                <Settings size={18} />
                个人设置
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <button onClick={handleSignOut} className="w-full flex items-center gap-2 text-danger">
                <LogOut size={18} />
                退出登录
              </button>
            </NavbarMenuItem>
          </>
        )}
        {!user && (
          <>
            <NavbarMenuItem>
              <Link href="/auth/login" className="w-full">
                登录
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link href="/auth/signup" className="w-full">
                注册
              </Link>
            </NavbarMenuItem>
          </>
        )}
      </NavbarMenu>
    </HeroNavbar>
  )
}

