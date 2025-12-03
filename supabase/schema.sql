-- 创建 feature schema
CREATE SCHEMA IF NOT EXISTS feature;

-- 授予 anon 和 authenticated 角色对 feature schema 的使用权限
GRANT USAGE ON SCHEMA feature TO anon, authenticated;

-- 授予对 feature schema 中所有表的权限
GRANT ALL ON ALL TABLES IN SCHEMA feature TO anon, authenticated;

-- 授予对所有序列的权限
GRANT ALL ON ALL SEQUENCES IN SCHEMA feature TO anon, authenticated;

-- 确保未来在 feature schema 中创建的表和序列也自动授予权限
ALTER DEFAULT PRIVILEGES IN SCHEMA feature GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA feature GRANT ALL ON SEQUENCES TO anon, authenticated;

-- 创建 profiles 表（扩展 auth.users）
CREATE TABLE IF NOT EXISTS feature.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 ideas 表
CREATE TABLE IF NOT EXISTS feature.ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES feature.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed', 'abandoned')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 idea_votes 表
CREATE TABLE IF NOT EXISTS feature.idea_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES feature.ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES feature.profiles(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT CHECK (vote_type IN ('up', 'down')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(idea_id, user_id)
);

-- 创建 comments 表（支持嵌套评论）
CREATE TABLE IF NOT EXISTS feature.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES feature.ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES feature.profiles(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES feature.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON feature.ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_visibility ON feature.ideas(visibility);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON feature.ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_updated_at ON feature.ideas(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_idea_votes_idea_id ON feature.idea_votes(idea_id);
CREATE INDEX IF NOT EXISTS idx_comments_idea_id ON feature.comments(idea_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON feature.comments(parent_id);

-- 创建视图用于获取想法统计信息
CREATE OR REPLACE VIEW feature.ideas_with_stats AS
SELECT 
  i.*,
  p.username as author_username,
  p.avatar as author_avatar,
  COALESCE(vote_counts.upvotes, 0) as upvotes,
  COALESCE(vote_counts.downvotes, 0) as downvotes,
  COALESCE(vote_counts.upvotes, 0) - COALESCE(vote_counts.downvotes, 0) as vote_score,
  COALESCE(comment_counts.comment_count, 0) as comment_count
FROM feature.ideas i
LEFT JOIN feature.profiles p ON i.user_id = p.id
LEFT JOIN (
  SELECT 
    idea_id,
    COUNT(*) FILTER (WHERE vote_type = 'up') as upvotes,
    COUNT(*) FILTER (WHERE vote_type = 'down') as downvotes
  FROM feature.idea_votes
  GROUP BY idea_id
) vote_counts ON i.id = vote_counts.idea_id
LEFT JOIN (
  SELECT idea_id, COUNT(*) as comment_count
  FROM feature.comments
  GROUP BY idea_id
) comment_counts ON i.id = comment_counts.idea_id;

-- 启用 Row Level Security (RLS)
ALTER TABLE feature.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature.idea_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature.comments ENABLE ROW LEVEL SECURITY;

-- Profiles 策略
-- 所有人可以查看用户资料
CREATE POLICY "公开查看用户资料" ON feature.profiles
  FOR SELECT USING (true);

-- 用户可以更新自己的资料
CREATE POLICY "用户可以更新自己的资料" ON feature.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 新用户注册时自动创建 profile
CREATE POLICY "用户可以插入自己的资料" ON feature.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Ideas 策略
-- 所有人可以查看公开想法
CREATE POLICY "所有人可以查看公开想法" ON feature.ideas
  FOR SELECT USING (
    visibility = 'public' OR 
    user_id = auth.uid()
  );

-- 已登录用户可以创建想法
CREATE POLICY "已登录用户可以创建想法" ON feature.ideas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的想法
CREATE POLICY "用户可以更新自己的想法" ON feature.ideas
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户可以删除自己的想法
CREATE POLICY "用户可以删除自己的想法" ON feature.ideas
  FOR DELETE USING (auth.uid() = user_id);

-- Idea Votes 策略
-- 所有人可以查看投票
CREATE POLICY "所有人可以查看投票" ON feature.idea_votes
  FOR SELECT USING (true);

-- 已登录用户可以投票
CREATE POLICY "已登录用户可以投票" ON feature.idea_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的投票
CREATE POLICY "用户可以更新自己的投票" ON feature.idea_votes
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户可以删除自己的投票
CREATE POLICY "用户可以删除自己的投票" ON feature.idea_votes
  FOR DELETE USING (auth.uid() = user_id);

-- Comments 策略
-- 所有人可以查看公开想法的评论
CREATE POLICY "所有人可以查看评论" ON feature.comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM feature.ideas 
      WHERE ideas.id = comments.idea_id 
      AND (ideas.visibility = 'public' OR ideas.user_id = auth.uid())
    )
  );

-- 已登录用户可以评论
CREATE POLICY "已登录用户可以评论" ON feature.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的评论
CREATE POLICY "用户可以更新自己的评论" ON feature.comments
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户可以删除自己的评论
CREATE POLICY "用户可以删除自己的评论" ON feature.comments
  FOR DELETE USING (auth.uid() = user_id);

-- 创建触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION feature.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON feature.profiles
  FOR EACH ROW EXECUTE FUNCTION feature.update_updated_at_column();

CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON feature.ideas
  FOR EACH ROW EXECUTE FUNCTION feature.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON feature.comments
  FOR EACH ROW EXECUTE FUNCTION feature.update_updated_at_column();

-- 创建触发器：新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION feature.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO feature.profiles (id, username)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION feature.handle_new_user();

