-- Migration 003: Row Level Security (RLS) policies for Ro Hub

-- Enable RLS on main tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Projects: public read, owner full access
CREATE POLICY IF NOT EXISTS projects_public_read ON projects FOR SELECT USING (visibility = 'public' OR owner_id = auth.uid());
CREATE POLICY IF NOT EXISTS projects_insert_owner ON projects FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY IF NOT EXISTS projects_owner_modify ON projects FOR UPDATE, DELETE USING (owner_id = auth.uid());

-- Versions: allow select when project is public or same owner; inserts allowed for authenticated users if project owner
CREATE POLICY IF NOT EXISTS versions_select ON versions FOR SELECT USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = versions.project_id AND (p.visibility = 'public' OR p.owner_id = auth.uid())));
CREATE POLICY IF NOT EXISTS versions_insert_owner ON versions FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM projects p WHERE p.id = versions.project_id AND p.owner_id = auth.uid()));
CREATE POLICY IF NOT EXISTS versions_owner_modify ON versions FOR UPDATE, DELETE USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = versions.project_id AND p.owner_id = auth.uid()));

-- Files: similar to versions
CREATE POLICY IF NOT EXISTS files_select ON files FOR SELECT USING (EXISTS (SELECT 1 FROM versions v JOIN projects p ON p.id = v.project_id WHERE v.id = files.version_id AND (p.visibility = 'public' OR p.owner_id = auth.uid())));
CREATE POLICY IF NOT EXISTS files_insert_owner ON files FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM versions v JOIN projects p ON p.id = v.project_id WHERE v.id = files.version_id AND p.owner_id = auth.uid()));
CREATE POLICY IF NOT EXISTS files_owner_modify ON files FOR UPDATE, DELETE USING (EXISTS (SELECT 1 FROM versions v JOIN projects p ON p.id = v.project_id WHERE v.id = files.version_id AND p.owner_id = auth.uid()));

-- Optional: only allow selecting users table for own profile info
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS users_self_select ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY IF NOT EXISTS users_self_modify ON users FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
