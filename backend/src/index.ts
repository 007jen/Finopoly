// // src/index.ts
// import app from './server';
// import dotenv from 'dotenv';
// dotenv.config();

// const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

// app.listen(PORT, () => {
//     console.log(`[INFO] Server running on port ${PORT}`);
// });

import app from "./server";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`[INFO] Server running on port ${PORT}`);
});
