import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Scale, 
  Award,
  Clock,
  Star,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

const CaseLawExplorer: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = ['All', 'Audit', 'Tax', 'Ind AS', 'FEMA', 'Corporate Law'];

  const caseLaws = [
    {
      id: '1',
      title: 'CIT vs. Hindustan Coca Cola Beverages',
      summary: 'Supreme Court ruling on manufacturing deduction under Section 80IA for bottling operations',
      category: 'Tax',
      difficulty: 'Intermediate',
      readTime: '8 min',
      xpReward: 150,
      isBookmarked: false,
      tags: ['Section 80IA', 'Manufacturing', 'Deduction']
    },
    {
      id: '2',
      title: 'Godrej & Boyce vs. State of Maharashtra',
      summary: 'VAT applicability on inter-state stock transfers between company branches',
      category: 'Tax',
      difficulty: 'Beginner',
      readTime: '5 min',
      xpReward: 100,
      isBookmarked: true,
      tags: ['VAT', 'Stock Transfer', 'Inter-state']
    },
    {
      id: '3',
      title: 'SEBI vs. Sahara India Real Estate Corp',
      summary: 'Landmark judgment on public deposits and regulatory compliance requirements',
      category: 'Corporate Law',
      difficulty: 'Pro',
      readTime: '12 min',
      xpReward: 250,
      isBookmarked: false,
      tags: ['SEBI', 'Public Deposits', 'Compliance']
    },
    {
      id: '4',
      title: 'RBI vs. Vijaya Bank',
      summary: 'Banking regulations and audit requirements for loan provisioning',
      category: 'Audit',
      difficulty: 'Intermediate',
      readTime: '10 min',
      xpReward: 180,
      isBookmarked: false,
      tags: ['Banking', 'Loan Provisioning', 'RBI Guidelines']
    },
    {
      id: '5',
      title: 'ICAI vs. Price Waterhouse',
      summary: 'Professional ethics and independence requirements for auditors',
      category: 'Audit',
      difficulty: 'Pro',
      readTime: '15 min',
      xpReward: 300,
      isBookmarked: true,
      tags: ['Professional Ethics', 'Independence', 'ICAI']
    },
    {
      id: '6',
      title: 'MCA vs. Satyam Computer Services',
      summary: 'Corporate governance failures and auditor responsibilities',
      category: 'Audit',
      difficulty: 'Pro',
      readTime: '18 min',
      xpReward: 350,
      isBookmarked: false,
      tags: ['Corporate Governance', 'Fraud', 'Auditor Liability']
    }
  ];

  const filteredCaseLaws = caseLaws.filter(caselaw => {
    const matchesSearch = caselaw.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         caselaw.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || caselaw.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Pro': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const badgeProgress = {
    current: 23,
    target: 50,
    nextBadge: 'Case Law Scholar'
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Case Law Explorer</h1>
        <p className="text-gray-600">Discover landmark judgments and legal precedents</p>
      </div>

      {/* Badge Progress */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Badge Progress</h2>
            <p className="opacity-90 mb-1">Next Badge: {badgeProgress.nextBadge}</p>
            <p className="text-sm opacity-75">{badgeProgress.current}/{badgeProgress.target} case laws completed</p>
          </div>
          <div className="text-right">
            <Award className="w-12 h-12 mb-2 mx-auto" />
            <div className="text-2xl font-bold">{Math.round((badgeProgress.current / badgeProgress.target) * 100)}%</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
            <div 
              className="bg-white h-3 rounded-full transition-all duration-300" 
              style={{ width: `${(badgeProgress.current / badgeProgress.target) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search case laws, judgments, or legal principles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-3 bg-white text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredCaseLaws.length} case law{filteredCaseLaws.length !== 1 ? 's' : ''}
          {selectedCategory !== 'All' && ` in ${selectedCategory}`}
        </p>
      </div>

      {/* Case Laws Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredCaseLaws.map((caselaw) => (
          <div 
            key={caselaw.id} 
            className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group ${
              viewMode === 'list' ? 'p-4' : 'p-6'
            }`}
          >
            <div className={viewMode === 'list' ? 'flex items-start gap-4' : ''}>
              <div className={viewMode === 'list' ? 'flex-1' : ''}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-blue-600" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(caselaw.difficulty)}`}>
                      {caselaw.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {caselaw.readTime}
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {caselaw.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {caselaw.summary}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {caselaw.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {caselaw.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      {caselaw.xpReward} XP
                    </div>
                  </div>
                  
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read More
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900 mb-1">156</div>
          <p className="text-gray-600 text-sm">Total Case Laws</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900 mb-1">23</div>
          <p className="text-gray-600 text-sm">Completed This Month</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <Award className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900 mb-1">4</div>
          <p className="text-gray-600 text-sm">Badges Earned</p>
        </div>
      </div>
    </div>
  );
};

export default CaseLawExplorer;