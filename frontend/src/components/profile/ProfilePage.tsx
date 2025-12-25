import React, { useState, useEffect } from 'react';
import {
    User,
    Star,
    Award,
    Calendar,
    TrendingUp,
    BookOpen,
    Target,
    Clock,
    Trophy,
    Edit,
    Download,
    Share2,
    CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useAccuracy } from '../../_accuracy/accuracy-context';
import { xpService } from '../../_xp/xp-service';

const ProfilePage: React.FC = () => {
    const { user, logout, updateUser } = useAuth();
    const { getToken } = useClerkAuth();
    const { accuracy } = useAccuracy();
    const [loading, setLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);
    const [profileOverview, setProfileOverview] = useState<any>(null);
    const MAX_RETRIES = 5;

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const fetchProfile = async () => {
            if (!user) return;

            try {
                const token = await getToken();
                const res = await fetch("/api/profile/overview", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.status === 401) {
                    throw new Error("Unauthorized"); // Do not retry on 401
                }

                if (res.status === 404) {
                    // User not ready yet - specific retry logic
                    if (retryCount < MAX_RETRIES) {
                        timeoutId = setTimeout(() => {
                            setRetryCount((c: number) => c + 1);
                        }, 1000);
                        return;
                    } else {
                        throw new Error("User setup failed after retries");
                    }
                }

                if (!res.ok) {
                    throw new Error(`Failed to fetch profile: ${res.statusText}`);
                }

                const data = await res.json();
                setProfileOverview(data);
                setLoading(false);
            } catch (err: any) {
                console.error("Profile fetch error:", err);
                // Only stop loading if it's NOT a retry-able 404 (which is handled above)
                // OR if it's a 401/500/Network error where we shouldn't retry or max retries hit
                if (err.message === "Unauthorized" || retryCount >= MAX_RETRIES) {
                    setLoading(false);
                }
            }
        };

        fetchProfile();

        return () => clearTimeout(timeoutId);
    }, [user, retryCount, getToken]);

    if (loading) {
        return (
            <div className="min-h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Setting up your account...</h3>
                    <p className="text-gray-600">This usually takes a few seconds.</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    // Use profileOverview data if available, fallback to user context
    const currentXp = profileOverview?.xp ?? user.xp;
    const currentLevel = profileOverview?.level ?? user.level;
    const xpToNextLevel = profileOverview?.xpToNextLevel ?? 350; // Fallback or calculated

    const journeyMilestones = [
        {
            date: '2024-01-01',
            title: 'Joined Finopoly',
            description: 'Started your learning journey',
            icon: User,
            color: 'from-blue-500 to-blue-600'
        },
        {
            date: '2024-01-15',
            title: 'First Badge Earned',
            description: 'Earned "Audit Rookie" badge',
            icon: Award,
            color: 'from-yellow-500 to-orange-500'
        },
        {
            date: '2024-01-20',
            title: 'Streak Master',
            description: 'Achieved 7-day learning streak',
            icon: Calendar,
            color: 'from-orange-500 to-red-500'
        },
        {
            date: '2024-01-25',
            title: 'Case Law Pro',
            description: 'Scored 90%+ in case law simulations',
            icon: Trophy,
            color: 'from-purple-500 to-pink-500'
        }
    ];

    const recentQuizScores = [
        { quiz: 'Audit Fundamentals', score: 85, maxScore: 100, date: '2024-01-28' },
        { quiz: 'Tax Compliance', score: 92, maxScore: 100, date: '2024-01-26' },
        { quiz: 'Case Law Analysis', score: 78, maxScore: 100, date: '2024-01-24' },
        { quiz: 'Financial Reporting', score: 88, maxScore: 100, date: '2024-01-22' },
    ];

    const savedCaseLaws = [
        { title: 'CIT vs. Hindustan Coca Cola Beverages', category: 'Tax', savedDate: '2024-01-27' },
        { title: 'SEBI vs. Sahara India Real Estate Corp', category: 'Corporate Law', savedDate: '2024-01-25' },
        { title: 'ICAI vs. Price Waterhouse', category: 'Audit', savedDate: '2024-01-23' },
    ];

    const handleExportData = () => {
        // Prepare CSV Data
        const headers = ["Category", "Metric", "Value"];
        const rows = [
            ["Profile", "Name", user.name || "Unknown"],
            ["Profile", "Email", user.email || "Unknown"],
            ["Profile", "Role", user.role || "Student"],
            ["Profile", "Joined", new Date(user.joinedDate).toLocaleDateString()],
            ["Stats", "Total XP", (profileOverview?.xp ?? user.xp).toString()],
            ["Stats", "Level", (profileOverview?.level ?? user.level).toString()],
            ["Stats", "Badges Earned", user.badges.length.toString()],
            ["Stats", "Current Streak", `${user.dailyStreak} days`],
            ["Stats", "Completed Simulations", user.completedSimulations.toString()],
            ["Stats", "Average Accuracy", `${accuracy}%`]
        ];

        // Convert to CSV String
        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        // Create Blob and Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `finopoly_stats_${user.name?.replace(/\s+/g, '_') || 'user'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-full bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/30">
            <div className="max-w-7xl mx-auto p-4 lg:p-8">
                <div className="mb-8">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">My Profile</h1>
                    <p className="text-gray-600 text-lg lg:text-xl">Track your learning progress and achievements</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 lg:p-8 text-center mb-8">
                            <div className="relative mb-6">
                                <div className="w-24 lg:w-32 h-24 lg:h-32 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                                    <User className="w-12 lg:w-16 h-12 lg:h-16 text-white" />
                                </div>
                                <button className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-1/2 bg-white border-2 border-gray-300 rounded-full p-2 hover:bg-gray-50 shadow-lg">
                                    <Edit className="w-4 h-4 text-gray-600" />
                                </button>
                            </div>

                            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">{user.name}</h2>
                            <p className="text-gray-500 mb-4">{user.email}</p>
                            <p className="text-gray-600 mb-6 text-lg">{user.role} • Level <span data-level-display>{user.level}</span></p>

                            <div className="flex items-center justify-center gap-3 mb-6">
                                <Star className="w-6 h-6 text-yellow-500" />
                                <span className="text-2xl font-bold text-gray-900"><span data-xp-display>{currentXp.toLocaleString()}</span> XP</span>
                            </div>

                            <div className="text-center mb-6">
                                <p className="text-sm text-gray-500 mb-2">Level <span data-level-display>{currentLevel}</span></p>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full" data-xp-progress style={{ width: '65%' }}></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2"><span data-xp-next>{xpToNextLevel}</span> XP to next level</p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105">
                                    <Share2 className="w-4 h-4" />
                                    Share Profile
                                </button>
                                <button
                                    onClick={handleExportData}
                                    className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-bold"
                                >
                                    <Download className="w-4 h-4" />
                                    Export Data
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
                            <h3 className="font-bold text-gray-900 mb-6 text-lg">Quick Stats</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Target className="w-5 h-5 text-blue-600" />
                                        <span className="text-gray-600 font-medium">Simulations</span>
                                    </div>
                                    <span className="font-bold text-gray-900 text-lg">{user.completedSimulations}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Award className="w-5 h-5 text-yellow-600" />
                                        <span className="text-gray-600 font-medium">Badges</span>
                                    </div>
                                    <span className="font-bold text-gray-900 text-lg">{user.badges.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-5 h-5 text-orange-600" />
                                        <span className="text-gray-600 font-medium">Streak</span>
                                    </div>
                                    <span className="font-bold text-gray-900 text-lg">{user.dailyStreak} days</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="w-5 h-5 text-green-600" />
                                        <span className="text-gray-600 font-medium">Avg. Accuracy</span>
                                    </div>
                                    <span className="font-bold text-gray-900 text-lg">
                                        {accuracy}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Badges Section */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 lg:p-8">
                            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Badges Earned</h3>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                                {user.badges.map((badge) => (
                                    <div key={badge.id} className="text-center p-4 lg:p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                                        <Award className="w-10 lg:w-12 h-10 lg:h-12 text-yellow-600 mx-auto mb-3" />
                                        <h4 className="font-bold text-gray-900 text-sm lg:text-base mb-2 truncate">{badge.name}</h4>
                                        <p className="text-xs lg:text-sm text-gray-600 line-clamp-2 mb-3">{badge.description}</p>
                                        <p className="text-xs text-gray-500 font-medium">
                                            {new Date(badge.earnedDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Journey Timeline */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 lg:p-8">
                            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Your Learning Journey</h3>
                            <div className="space-y-6">
                                {journeyMilestones.map((milestone, index) => {
                                    const Icon = milestone.icon;
                                    return (
                                        <div key={index} className="flex items-start gap-6">
                                            <div className={`w-12 lg:w-14 h-12 lg:h-14 bg-gradient-to-br ${milestone.color} rounded-full flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                                <Icon className="w-6 lg:w-7 h-6 lg:h-7 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                                                    <h4 className="font-bold text-gray-900 text-base lg:text-lg">{milestone.title}</h4>
                                                    <span className="text-sm text-gray-500 font-medium">
                                                        {new Date(milestone.date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 mt-2">{milestone.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Recent Quiz Scores */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 lg:p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl lg:text-2xl font-bold text-gray-900">Recent Quiz Scores</h3>
                                <button
                                    onClick={async () => {
                                        try {
                                            const token = await getToken();
                                            await fetch('/api/progress/xp', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                                body: JSON.stringify({
                                                    amount: 3000,
                                                    source: 'Test Quiz (Mega Reward)',
                                                    score: Math.floor(Math.random() * 40) + 60 // Random score between 60 and 100
                                                })
                                            });
                                            window.location.reload();
                                        } catch (e) { console.error(e); }
                                    }}
                                    className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                                >
                                    + Test Activity
                                </button>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {recentQuizScores.map((quiz, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 lg:p-5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:shadow-md transition-all duration-300">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900 text-base truncate">{quiz.quiz}</h4>
                                            <p className="text-sm text-gray-500 font-medium">
                                                {new Date(quiz.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-gray-900 text-lg">
                                                {quiz.score}/{quiz.maxScore}
                                            </div>
                                            <div className={`text-sm font-bold ${quiz.score >= 90 ? 'text-green-600' :
                                                quiz.score >= 75 ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                {Math.round((quiz.score / quiz.maxScore) * 100)}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Saved Case Laws - LOCKED */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 lg:p-8 relative overflow-hidden group">
                            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Saved Case Laws</h3>

                            {/* Blur Overlay */}
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
                                <div className="bg-gray-900/5 p-4 rounded-full mb-3">
                                    <BookOpen className="w-8 h-8 text-gray-400" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900">Coming Soon</h4>
                                <p className="text-sm text-gray-600 font-medium">Case Law Bookmarks are under development</p>
                            </div>

                            {/* Background Content ( Blurred ) */}
                            <div className="space-y-4 opacity-40 pointer-events-none select-none">
                                {savedCaseLaws.map((caselaw, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 lg:p-5 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl">
                                        <div className="flex items-center gap-4">
                                            <BookOpen className="w-6 h-6 text-purple-600 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 text-sm lg:text-base truncate">{caselaw.title}</h4>
                                                <p className="text-xs lg:text-sm text-gray-500 font-medium">{caselaw.category}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs lg:text-sm text-gray-500 font-medium">
                                                Saved {new Date(caselaw.savedDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-red-50/50 backdrop-blur-sm rounded-2xl shadow-lg border border-red-100 p-6 lg:p-8">
                            <h3 className="text-xl lg:text-2xl font-bold text-red-700 mb-6">Danger Zone</h3>
                            <div className="space-y-4">

                                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-100">
                                    <div>
                                        <h4 className="font-bold text-gray-900">Reset Progress</h4>
                                        <p className="text-sm text-gray-600">Clears all XP, Streak, and Activity History. This cannot be undone.</p>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (!window.confirm("Are you sure you want to RESET your progress? This cannot be undone.")) return;
                                            try {
                                                const token = await getToken();
                                                const res = await fetch('/api/profile/reset', {
                                                    method: 'POST',
                                                    headers: { Authorization: `Bearer ${token}` }
                                                });
                                                if (res.ok) {
                                                    // Seamless Reset
                                                    xpService.reset();
                                                    await updateUser({
                                                        xp: 0,
                                                        dailyStreak: 0,
                                                        completedSimulations: 0,
                                                        badges: [],
                                                        accuracy: { audit: 0, tax: 0, caselaw: 0 }
                                                    });
                                                    alert("Progress reset successfully.");
                                                } else {
                                                    alert("Failed to reset progress.");
                                                }
                                            } catch (e) {
                                                console.error(e);
                                                alert("An error occurred.");
                                            }
                                        }}
                                        className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200 transition-colors"
                                    >
                                        Reset Progress
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-100">
                                    <div>
                                        <h4 className="font-bold text-gray-900">Delete Account</h4>
                                        <p className="text-sm text-gray-600">Permanently delete your account and all data.</p>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            const confirmText = prompt("Type 'DELETE' to confirm account deletion. This action is irreversible.");
                                            if (confirmText !== 'DELETE') return;

                                            try {
                                                const token = await getToken();
                                                const res = await fetch('/api/profile/delete', {
                                                    method: 'DELETE',
                                                    headers: { Authorization: `Bearer ${token}` }
                                                });
                                                if (res.ok) {
                                                    alert("Account deleted. Goodbye!");
                                                    await logout();
                                                    window.location.href = '/sign-in';
                                                } else {
                                                    alert("Failed to delete account.");
                                                }
                                            } catch (e) {
                                                console.error(e);
                                                alert("An error occurred.");
                                            }
                                        }}
                                        className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                                    >
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;