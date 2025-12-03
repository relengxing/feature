// Supabase 配置
export const SUPABASE_SCHEMA = 'feature'

// 数据库表名（不含 schema 前缀）
export const TABLES = {
  PROFILES: 'profiles',
  IDEAS: 'ideas',
  IDEA_VOTES: 'idea_votes',
  COMMENTS: 'comments',
} as const

// 视图名称
export const VIEWS = {
  IDEAS_WITH_STATS: 'ideas_with_stats',
} as const

