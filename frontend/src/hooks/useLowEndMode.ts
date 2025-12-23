import { useState, useEffect } from 'react';

export const useLowEndMode = () => {
    const [isLowEnd, setIsLowEnd] = useState(false);

    useEffect(() => {
        const checkLowEnd = () => {
            // 1. Screen Width Constraint (< 360px is considered very small/older device)
            const isSmallScreen = window.innerWidth < 360;

            // 2. Network Constraint (2g or slow-2g)
            // @ts-ignore - navigator.connection is standard but experimental in types
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            const isSlowNetwork = connection ? ['slow-2g', '2g'].includes(connection.effectiveType) : false;

            // 3. Hardware Concurrency (Heuristic for low CPU count)
            // Low-end phones often have 4 or fewer cores available to the browser context
            const isLowCpu = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false;

            // Combined Heuristic
            // We enable Low End Mode if network is slow OR screen is tiny.
            // CPU check is less reliable alone, but could be added if needed.
            // For now, strict responsiveness requirements focus on screen & net.
            setIsLowEnd(isSmallScreen || isSlowNetwork || isLowCpu);
        };

        checkLowEnd();

        // Listen for resize
        window.addEventListener('resize', checkLowEnd);

        // Listen for network change if supported
        // @ts-ignore
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            connection.addEventListener('change', checkLowEnd);
        }

        return () => {
            window.removeEventListener('resize', checkLowEnd);
            if (connection) {
                connection.removeEventListener('change', checkLowEnd);
            }
        };
    }, []);

    return isLowEnd;
};
