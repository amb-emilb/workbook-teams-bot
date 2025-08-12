#!/usr/bin/env node

/**
 * Teams App Packager
 * 
 * Creates a Teams app package (.zip) from manifest and icons
 * Run after creating the required PNG icons
 */

import * as fs from 'fs';
import * as path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import archiver from 'archiver';

const pipelineAsync = promisify(pipeline);

async function packageTeamsApp() {
    const requiredFiles = [
        'manifest.json',
        'icon-outline.png',
        'icon-color.png'
    ];

    console.log('📦 Packaging Teams App...');
    
    // Check if all required files exist
    const missingFiles = requiredFiles.filter(file => 
        !fs.existsSync(path.join(process.cwd(), file))
    );

    if (missingFiles.length > 0) {
        console.error('❌ Missing required files:');
        missingFiles.forEach(file => console.error(`   - ${file}`));
        console.error('\nPlease create the missing files and try again.');
        console.error('See README.md for instructions.');
        process.exit(1);
    }

    // Create the package
    const output = createWriteStream('workbook-teams-app.zip');
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
        console.log('✅ Teams app packaged successfully!');
        console.log(`📁 Package size: ${archive.pointer()} bytes`);
        console.log('📝 File: workbook-teams-app.zip');
        console.log('\n🚀 Next steps:');
        console.log('1. Go to https://dev.teams.microsoft.com/apps');
        console.log('2. Click "Import app" or "Upload an app"');
        console.log('3. Select workbook-teams-app.zip');
        console.log('4. Configure and publish to your Teams environment');
    });

    archive.on('error', (err) => {
        console.error('❌ Error creating package:', err);
        process.exit(1);
    });

    archive.pipe(output);

    // Add files to archive
    requiredFiles.forEach(file => {
        archive.file(file, { name: file });
        console.log(`📄 Added: ${file}`);
    });

    await archive.finalize();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    packageTeamsApp().catch(console.error);
}

export { packageTeamsApp };