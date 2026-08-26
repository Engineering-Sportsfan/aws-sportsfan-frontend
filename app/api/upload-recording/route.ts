import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import stream from 'stream';
import path from 'path';

export const runtime = 'nodejs';

// Use the JSON key we copied into the project root
const KEY_FILE_PATH = path.join(process.cwd(), 'google-drive-key.json');
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('video') as Blob | null;
        
        if (!file) {
            return NextResponse.json({ error: "No video file provided" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        
        // Authenticate with the Service Account
        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_FILE_PATH,
            scopes: SCOPES,
        });

        const drive = google.drive({ version: 'v3', auth });

        // Convert the video buffer to a readable stream
        const bufferStream = new stream.PassThrough();
        bufferStream.end(buffer);

        console.log("Uploading video to Google Drive...");

        const response = await drive.files.create({
            requestBody: {
                name: `Watchroom-Recording-${new Date().toISOString().split('T')[0]}.webm`,
                parents: ['0AG3_V_78whF4Uk9PVA'], // The new Shared Drive folder ID
            },
            media: {
                mimeType: 'video/webm',
                body: bufferStream,
            },
            fields: 'id, webViewLink',
            supportsAllDrives: true,
        });

        console.log("Google Drive upload successful:", response.data);

        return NextResponse.json({ success: true, file: response.data }, { status: 200 });

    } catch (error: any) {
        console.error("Error uploading to Google Drive:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
