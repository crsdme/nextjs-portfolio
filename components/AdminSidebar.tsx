import { LayoutGrid, Settings, User, Users } from 'lucide-react'
import * as React from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/'
import { NavUser } from './AdminSidebarUser'

const data = {
  navMain: [
    {
      title: 'Основное',
      items: [
        {
          title: 'Авторы',
          url: '/admin/authors',
          icon: User,
          isActive: false,
        },
        {
          title: 'Проекты',
          url: '/admin/projects',
          icon: LayoutGrid,
          isActive: false,
        },
        {
          title: 'Пользователи',
          url: '/admin/users',
          icon: Users,
          isActive: false,
        },
        {
          title: 'Настройки',
          url: '/admin/settings',
          icon: Settings,
          isActive: false,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarContent>
        {data.navMain.map(item => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <a href={item.url}>
                        {item.icon && <item.icon />}
                        {item.title}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: 'Admin', email: 'admin@site.local', avatar: '/images/admin.jpg' }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
