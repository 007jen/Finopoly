import 'dotenv/config';
import { server, PORT } from "./server";

server.listen(PORT, () => {
    console.log(`\n---------------------------------------`);
    console.log(`🚀 UNIFIED SERVER RUNNING ON PORT ${PORT}`);
    console.log(`🔗 Socket.io Readiness: [ACTIVE]`);
    console.log(`---------------------------------------\n`);
});
