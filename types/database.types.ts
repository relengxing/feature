export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'user' | 'super_admin'
export type IdeaStatus = 'planning' | 'in_progress' | 'completed' | 'abandoned'
export type IdeaVisibility = 'public' | 'private'
export type VoteType = 'up' | 'down'

export interface Database {
  feature: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar: string | null
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
      }
      ideas: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          status: IdeaStatus
          visibility: IdeaVisibility
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          status?: IdeaStatus
          visibility?: IdeaVisibility
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          status?: IdeaStatus
          visibility?: IdeaVisibility
          created_at?: string
          updated_at?: string
        }
      }
      idea_votes: {
        Row: {
          id: string
          idea_id: string
          user_id: string
          vote_type: VoteType
          created_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          user_id: string
          vote_type: VoteType
          created_at?: string
        }
        Update: {
          id?: string
          idea_id?: string
          user_id?: string
          vote_type?: VoteType
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          idea_id: string
          user_id: string
          parent_id: string | null
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          user_id: string
          parent_id?: string | null
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          idea_id?: string
          user_id?: string
          parent_id?: string | null
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      ideas_with_stats: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          status: IdeaStatus
          visibility: IdeaVisibility
          created_at: string
          updated_at: string
          author_username: string | null
          author_avatar: string | null
          upvotes: number
          downvotes: number
          vote_score: number
          comment_count: number
        }
      }
    }
    Functions: {}
    Enums: {}
  }
}

// 辅助类型
export type Profile = Database['feature']['Tables']['profiles']['Row']
export type Idea = Database['feature']['Tables']['ideas']['Row']
export type IdeaWithStats = Database['feature']['Views']['ideas_with_stats']['Row']
export type IdeaVote = Database['feature']['Tables']['idea_votes']['Row']
export type Comment = Database['feature']['Tables']['comments']['Row']

// 带用户信息的评论
export type CommentWithUser = Comment & {
  profiles: Pick<Profile, 'username' | 'avatar'> | null
}

// 嵌套评论结构
export type CommentTree = CommentWithUser & {
  replies?: CommentTree[]
}

