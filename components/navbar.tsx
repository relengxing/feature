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
import { User, LogOut, Settings, PlusCircle, Home, Shield, Sparkles } from 'lucide-react'
import type { Profile } from '@/types/database.types'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

interface NavbarProps {
  user: { id: string; email?: string } | null
  profile: Profile | null
}

export function Navbar({ user, profile }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <HeroNavbar 
      maxWidth="xl" 
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      classNames={{
        base: "bg-background/70 backdrop-blur-xl border-b border-default-200/50",
        wrapper: "px-4 sm:px-6",
        brand: "gap-3",
        content: "gap-4",
        item: [
          "flex",
          "relative",
          "h-full",
          "items-center",
          "data-[active=true]:after:content-['']",
          "data-[active=true]:after:absolute",
          "data-[active=true]:after:bottom-0",
          "data-[active=true]:after:left-0",
          "data-[active=true]:after:right-0",
          "data-[active=true]:after:h-[2px]",
          "data-[active=true]:after:rounded-full",
          "data-[active=true]:after:bg-gradient-to-r",
          "data-[active=true]:after:from-accent-primary",
          "data-[active=true]:after:to-accent-tertiary",
        ],
      }}
    >
      <NavbarContent>
        <NavbarMenuToggle className="sm:hidden" />
        <NavbarBrand>
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-accent-tertiary flex items-center justify-center shadow-glow-accent group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-accent-primary to-[#ff8c5a] bg-clip-text text-transparent">
              想法记录
            </span>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-6" justify="center">
        <NavbarItem isActive={isActive('/')}>
          <Link 
            href="/" 
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
              isActive('/') 
                ? 'text-accent-primary font-medium' 
                : 'text-default-600 hover:text-accent-primary hover:bg-accent-primary/5'
            }`}
          >
            <Home size={18} />
            首页
          </Link>
        </NavbarItem>
        {user && (
          <NavbarItem isActive={isActive('/ideas/new')}>
            <Link 
              href="/ideas/new" 
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive('/ideas/new') 
                  ? 'text-accent-primary font-medium' 
                  : 'text-default-600 hover:text-accent-primary hover:bg-accent-primary/5'
              }`}
            >
              <PlusCircle size={18} />
              发布想法
            </Link>
          </NavbarItem>
        )}
        {profile?.role === 'super_admin' && (
          <NavbarItem isActive={isActive('/admin')}>
            <Link 
              href="/admin" 
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive('/admin') 
                  ? 'text-accent-primary font-medium' 
                  : 'text-default-600 hover:text-accent-primary hover:bg-accent-primary/5'
              }`}
            >
              <Shield size={18} />
              管理面板
            </Link>
          </NavbarItem>
        )}
      </NavbarContent>

      <NavbarContent justify="end" className="gap-3">
        {user ? (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform hover:scale-105 ring-accent-primary/50"
                src={profile?.avatar || undefined}
                name={profile?.username || user.email || 'User'}
                size="sm"
                color="primary"
              />
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="用户菜单" 
              variant="flat"
              classNames={{
                base: "min-w-[200px]",
              }}
            >
              <DropdownItem key="profile" className="h-14 gap-2" textValue="用户信息">
                <p className="font-semibold text-default-600">登录为</p>
                <p className="font-bold text-accent-primary">{profile?.username || user.email}</p>
              </DropdownItem>
              <DropdownItem
                key="my-ideas"
                startContent={<User size={18} className="text-default-500" />}
                as={Link}
                href="/profile/ideas"
                className="py-2"
              >
                我的想法
              </DropdownItem>
              <DropdownItem
                key="settings"
                startContent={<Settings size={18} className="text-default-500" />}
                as={Link}
                href="/profile/settings"
                className="py-2"
              >
                个人设置
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                startContent={<LogOut size={18} />}
                onClick={handleSignOut}
                className="py-2"
              >
                退出登录
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <>
            <NavbarItem className="hidden sm:flex">
              <Button 
                as={Link} 
                href="/auth/login" 
                variant="light"
                className="text-default-600 hover:text-accent-primary"
              >
                登录
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button 
                as={Link} 
                href="/auth/signup" 
                className="btn-gradient font-semibold"
              >
                注册
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>

      <NavbarMenu className="pt-6 bg-background/95 backdrop-blur-xl">
        {menuItems.map((item) => (
          <NavbarMenuItem key={item.href}>
            <Link 
              href={item.href} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive(item.href)
                  ? 'bg-accent-primary/10 text-accent-primary font-medium'
                  : 'text-default-600 hover:bg-default-100'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
        {user && (
          <>
            <NavbarMenuItem>
              <Link 
                href="/profile/ideas" 
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-default-600 hover:bg-default-100 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={20} />
                我的想法
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link 
                href="/profile/settings" 
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-default-600 hover:bg-default-100 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings size={20} />
                个人设置
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <button 
                onClick={() => {
                  handleSignOut()
                  setIsMenuOpen(false)
                }} 
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-danger hover:bg-danger/10 transition-all duration-200"
              >
                <LogOut size={20} />
                退出登录
              </button>
            </NavbarMenuItem>
          </>
        )}
        {!user && (
          <>
            <NavbarMenuItem>
              <Link 
                href="/auth/login" 
                className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-default-600 hover:bg-default-100 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                登录
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link 
                href="/auth/signup" 
                className="w-full flex items-center justify-center px-4 py-3 rounded-xl btn-gradient text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                注册
              </Link>
            </NavbarMenuItem>
          </>
        )}
      </NavbarMenu>
    </HeroNavbar>
  )
}
