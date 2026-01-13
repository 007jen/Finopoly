import { Request, Response } from 'express';
import { prisma } from "../utils/prisma";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Custom Request Interface to include File
interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Navigate up from src/controllers to root then into uploads/courses
        const uploadPath = path.join(__dirname, '../../uploads/courses');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Sanitize filename and add timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Multer Upload Instance
export const upload = multer({
    storage: storage,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed!'));
        }
    }
});

export const createCourse = async (req: Request, res: Response) => {
    try {
        const { title, description, duration, level, expert } = req.body;
        const file = (req as MulterRequest).file;

        if (!file) {
            return res.status(400).json({ error: 'Video file is required' });
        }

        // Construct the public URL for the video
        // Assuming 'uploads' is served statically from root
        const videoUrl = `/uploads/courses/${file.filename}`;

        const course = await prisma.course.create({
            data: {
                title,
                description,
                videoUrl,
                duration: duration || '0 min',
                level: level || 'Beginner',
                expert: expert || 'Unknown',
                // Add a random placeholder thumbnail if none provided
                thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'
            }
        });

        res.status(201).json(course);
    } catch (error) {
        console.error('Error uploading course:', error);
        res.status(500).json({ error: 'Failed to create course' });
    }
};

export const getCourses = async (req: Request, res: Response) => {
    try {
        const courses = await prisma.course.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};
