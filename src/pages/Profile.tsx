import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserCircle, Plus, X, Github, Linkedin, Mail, Lock } from 'lucide-react';

interface Profile {
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  github_url: string | null;
  linkedin_url: string | null;
}

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface AuthForm {
  email: string;
  password: string;
  username?: string;
}

function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<Skill[]>([]);
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const [selectedSkill, setSelectedSkill] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authForm, setAuthForm] = useState<AuthForm>({
    email: '',
    password: '',
    username: '',
  });
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await fetchUserData(user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserData(userId: string) {
    try {
      const [profileData, skillsData, userSkillsData] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('skills').select('*').order('category'),
        supabase.from('user_skills')
          .select(`
            skill_id,
            skills (*)
          `)
          .eq('profile_id', userId)
      ]);

      if (profileData.error) throw profileData.error;
      if (skillsData.error) throw skillsData.error;
      if (userSkillsData.error) throw userSkillsData.error;

      setProfile(profileData.data);
      setFormData(profileData.data);
      setSkills(skillsData.data);
      setUserSkills(userSkillsData.data.map((us: any) => us.skills));
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: authForm.email,
        password: authForm.password,
      });
      if (error) throw error;
      checkUser();
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!authForm.username) {
      setAuthError('Username is required');
      return;
    }
    try {
      const { error: signUpError, data } = await supabase.auth.signUp({
        email: authForm.email,
        password: authForm.password,
      });
      if (signUpError) throw signUpError;

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username: authForm.username,
            email: authForm.email,
          });
        if (profileError) throw profileError;
      }
      checkUser();
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUserSkills([]);
    setFormData({});
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id);

      if (error) throw error;
      setProfile({ ...profile, ...formData } as Profile);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleAddSkill = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !selectedSkill) return;

      const { error } = await supabase
        .from('user_skills')
        .insert({ profile_id: user.id, skill_id: selectedSkill });

      if (error) throw error;

      const newSkill = skills.find(s => s.id === selectedSkill);
      if (newSkill) {
        setUserSkills([...userSkills, newSkill]);
      }
      setSelectedSkill('');
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_skills')
        .delete()
        .eq('profile_id', user.id)
        .eq('skill_id', skillId);

      if (error) throw error;
      setUserSkills(userSkills.filter(s => s.id !== skillId));
    } catch (error) {
      console.error('Error removing skill:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="text-center mb-6">
            <UserCircle className="w-16 h-16 mx-auto text-gray-400" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              {isSignUp ? 'Create an Account' : 'Sign In'}
            </h2>
          </div>

          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    value={authForm.username}
                    onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 relative">
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative">
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {authError && (
              <div className="text-red-600 text-sm">{authError}</div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setAuthError(null);
                setAuthForm({ email: '', password: '', username: '' });
              }}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <UserCircle className="h-20 w-20 text-gray-400" />
              )}
              <div className="ml-6">
                {editing ? (
                  <input
                    type="text"
                    value={formData.full_name || ''}
                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                    className="text-2xl font-bold text-gray-900 border rounded px-2"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-gray-900">{profile.full_name || profile.username}</h1>
                )}
                <p className="text-gray-600">@{profile.username}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => editing ? handleSave() : setEditing(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                {editing ? 'Save' : 'Edit Profile'}
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Sign Out
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-gray-700 font-medium">Bio</h3>
              {editing ? (
                <textarea
                  value={formData.bio || ''}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  className="mt-2 w-full h-32 px-3 py-2 border rounded-md"
                />
              ) : (
                <p className="mt-2 text-gray-600">{profile.bio || 'No bio added yet'}</p>
              )}
            </div>

            <div>
              <h3 className="text-gray-700 font-medium">Location</h3>
              {editing ? (
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="mt-2 w-full px-3 py-2 border rounded-md"
                />
              ) : (
                <p className="mt-2 text-gray-600">{profile.location || 'No location added'}</p>
              )}
            </div>

            <div>
              <h3 className="text-gray-700 font-medium">Skills</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {userSkills.map(skill => (
                  <span
                    key={skill.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                  >
                    {skill.name}
                    {editing && (
                      <button
                        onClick={() => handleRemoveSkill(skill.id)}
                        className="ml-2 text-indigo-600 hover:text-indigo-800"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </span>
                ))}
                {editing && (
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedSkill}
                      onChange={e => setSelectedSkill(e.target.value)}
                      className="px-3 py-1 border rounded-md"
                    >
                      <option value="">Select a skill</option>
                      {skills.map(skill => (
                        <option key={skill.id} value={skill.id}>
                          {skill.name} ({skill.category})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAddSkill}
                      disabled={!selectedSkill}
                      className="p-1 text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-gray-700 font-medium">Social Links</h3>
              <div className="mt-2 space-y-2">
                {editing ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Github size={20} className="text-gray-600" />
                      <input
                        type="text"
                        value={formData.github_url || ''}
                        onChange={e => setFormData({ ...formData, github_url: e.target.value })}
                        placeholder="GitHub URL"
                        className="flex-1 px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Linkedin size={20} className="text-gray-600" />
                      <input
                        type="text"
                        value={formData.linkedin_url || ''}
                        onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })}
                        placeholder="LinkedIn URL"
                        className="flex-1 px-3 py-2 border rounded-md"
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex gap-4">
                    {profile.github_url && (
                      <a
                        href={profile.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Github size={24} />
                      </a>
                    )}
                    {profile.linkedin_url && (
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Linkedin size={24} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;