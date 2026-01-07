import { Request, Response, NextFunction } from 'express';

export const performanceLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();

    res.on('finish', () => {
        const diff = process.hrtime(start);
        const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);

        // Detailed log for slow requests (> 500ms)
        const isSlow = parseFloat(timeInMs) > 500;
        const logPrefix = isSlow ? '⚠️ [PERF-SLOW]' : '⏱️ [PERF]';

        console.log(`${logPrefix} ${req.method} ${req.originalUrl} - ${timeInMs}ms`);
    });

    next();
};
