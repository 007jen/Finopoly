import React, { useState, useEffect, useRef } from 'react';
import { Play, Search } from 'lucide-react';
import { api } from '../../lib/api';

interface Course {
    id: string;
    title: string;
    description: string;
    duration: string;
    // thumbnail removed
    expert: string;
    level: string;
    views: number;
    videoUrl: string;
}

const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handlePlay = () => {
        setIsPlaying(true);
        videoRef.current?.play();
    };

    return (
        <div className="group bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col">
            {/* Video Player Header */}
            <div className="relative h-48 bg-black">
                <video
                    ref={videoRef}
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${course.videoUrl}`}
                    className="w-full h-full object-cover"
                    controls={isPlaying}
                    preload="metadata"
                    onPause={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                />

                {/* Play Overlay */}
                {!isPlaying && (
                    <div
                        className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 cursor-pointer transition-colors z-10"
                        onClick={handlePlay}
                    >
                        <div className="w-14 h-14 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300">
                            <Play className="w-6 h-6 text-blue-600 ml-1" fill="currentColor" />
                        </div>
                    </div>
                )}
            </div>

            {/* Content Body */}
            <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                    {course.title}
                </h3>

                <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed">
                    {course.description}
                </p>

                <div className="mt-auto flex items-center gap-3 pt-4 border-t border-gray-50">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                        {course.expert.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900">{course.expert}</span>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Instructor</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CoursesPage: React.FC = () => {
    // ... rest of component
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch Courses
    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const data = await api.get<Course[]>('/api/courses');
            setCourses(data);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter Data
    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.expert.toLowerCase().includes(searchQuery.toLowerCase())
    );



    return (
        <div className="min-h-screen bg-transparent p-4 lg:p-8 space-y-8 animate-in fade-in duration-500">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-2">
                        Industry Insights
                    </h1>
                    <p className="text-gray-500 font-medium max-w-xl">
                        Learn directly from the experts. Real-world experiences, case studies, and technical deep dives to bridge the gap between theory and practice.
                    </p>
                </div>


            </div>

            {/* SEARCH BAR */}
            <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-2xl leading-5 bg-white/50 backdrop-blur-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                    placeholder="Search by topic or expert..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* COURSES GRID */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <p className="text-lg font-bold">No courses found.</p>
                    <p className="text-sm">Be the first to upload one!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {filteredCourses.map((course) => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            )}


        </div>
    );
};

export default CoursesPage;
