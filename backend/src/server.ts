import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes will be imported here
// app.use('/api/auth', authRoutes);
// app.use('/api/content', contentRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Finopoly Backend API' });
});

export default app;
