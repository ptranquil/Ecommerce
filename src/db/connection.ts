import mongoose from 'mongoose';


export async function connectToDB(): Promise<void> {
    try {
        await mongoose.connect(process.env.MONGO_URI + '/' + process.env.DATABASE_NAME!)
        console.log('Database Connected');
    } catch (error: any) {
        console.log('Database Connection Failed: ', error.message);
        handleConnectionError(error);
    }
}

async function handleConnectionError(error: any, retryCount: number = 0): Promise<void> {
    const maxRetries = 3;
    while (retryCount < maxRetries) {
        console.log(`Retrying connection... (Retry ${retryCount + 1}/${maxRetries})`);
        try {
            await mongoose.connect(process.env.MONGO_URI + process.env.DATABASE_NAME!)
            console.log('Database Connected');
        } catch (error) {
            await sleep(3000);
            retryCount++;
        }
    }
    console.log('Max connection retries reached. Exiting.');
    process.exit(1);
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
