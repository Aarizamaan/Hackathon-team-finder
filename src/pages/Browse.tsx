import React, { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  skills: Array<{
    id: string;
    name: string;
    category: string;
  }>;
}

interface Skill {
  id: string;
  name: string;
  category: string;
}

function Browse() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    fetchProfiles();
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('category');
      
      if (error) throw error;
      setSkills(data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_skills (
            skills (
              id,
              name,
              category
            )
          )
        `);

      if (profilesError) throw profilesError;

      const formattedProfiles = profilesData.map((profile: any) => ({
        ...profile,
        skills: profile.user_skills.map((us: any) => us.skills)
      }));

      setProfiles(formattedProfiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProfiles = () => {
    return profiles.filter(profile => {
      const matchesSearch = 
        !searchTerm ||
        profile.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (profile.full_name && profile.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (profile.bio && profile.bio.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSkills = 
        selectedSkills.length === 0 ||
        selectedSkills.every(skillId => 
          profile.skills.some(skill => skill.id === skillId)
        );

      const matchesCategory =
        !selectedCategory ||
        profile.skills.some(skill => skill.category === selectedCategory);

      return matchesSearch && matchesSkills && matchesCategory;
    });
  };

  const categories = Array.from(new Set(skills.map(skill => skill.category)));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Find Teammates</h1>
          <p className="text-gray-600 text-lg">Connect with talented developers for your next hackathon</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-64 bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Filter size={20} />
              Filters
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border rounded-md py-2 px-3"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills
                </label>
                <div className="space-y-2">
                  {skills
                    .filter(skill => !selectedCategory || skill.category === selectedCategory)
                    .map(skill => (
                      <label key={skill.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedSkills.includes(skill.id)}
                          onChange={() => {
                            setSelectedSkills(
                              selectedSkills.includes(skill.id)
                                ? selectedSkills.filter(id => id !== skill.id)
                                : [...selectedSkills, skill.id]
                            );
                          }}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">{skill.name}</span>
                      </label>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search by name, username, or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filterProfiles().map(profile => (
                <div key={profile.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center space-x-4">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.username}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-xl font-medium">
                          {profile.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {profile.full_name || profile.username}
                      </h3>
                      <p className="text-gray-600">@{profile.username}</p>
                    </div>
                  </div>

                  {profile.bio && (
                    <p className="mt-4 text-gray-600 line-clamp-2">{profile.bio}</p>
                  )}

                  {profile.skills.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map(skill => (
                          <span
                            key={skill.id}
                            className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.location && (
                    <div className="mt-4 text-sm text-gray-600">
                      📍 {profile.location}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Browse;