import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, UserCircle } from 'lucide-react';

const Home = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Find Your Perfect Hackathon Team
        </h1>
        <p className="text-xl text-gray-600">
          Connect with talented developers, designers, and creators for your next hackathon project.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
            <UserCircle className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Create Your Profile</h3>
          <p className="text-gray-600">
            Showcase your skills, experience, and the technologies you love working with.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
            <Search className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Find Teammates</h3>
          <p className="text-gray-600">
            Search for potential teammates based on skills, location, and hackathon interests.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
            <Users className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Join Hackathons</h3>
          <p className="text-gray-600">
            Browse upcoming hackathons and connect with others who are interested in participating.
          </p>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <Link
          to="/browse"
          className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Browse Teammates
        </Link>
        <Link
          to="/profile"
          className="px-6 py-3 bg-white text-indigo-600 rounded-md border border-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          Create Profile
        </Link>
      </div>
    </div>
  );
};

export default Home;