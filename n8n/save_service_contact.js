#!/usr/local/bin/node
/**
 * Persist client service inquiry into local SQLite database & JSONL audit log
 * Host: Mac mini M4
 * Path: ~/services-ai/contacts.sqlite
 */

const sqlite3 = require('/usr/local/lib/node_modules/n8n/node_modules/sqlite3');
const path = require('path');
const os = require('os');
const fs = require('fs');

const baseDir = path.join(process.env.HOME || os.homedir() || '/Users/gezahorvath', 'services-ai');
fs.mkdirSync(baseDir, { recursive: true });

const dbPath = path.join(baseDir, 'contacts.sqlite');
const db = new sqlite3.Database(dbPath);

try {
  const rawArg = process.argv[2];
  if (!rawArg) {
    console.error(JSON.stringify({ status: 'error', message: 'No payload provided' }));
    process.exit(1);
  }

  let jsonStr = rawArg;
  if (/^[A-Za-z0-9+/=]+$/.test(rawArg) && (rawArg.startsWith('ey') || rawArg.length % 4 === 0)) {
    try {
      const decoded = Buffer.from(rawArg, 'base64').toString('utf8');
      if (decoded.startsWith('{')) {
        jsonStr = decoded;
      }
    } catch (_) {}
  }

  const payload = JSON.parse(jsonStr);

  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS service_contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submission_id TEXT UNIQUE,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT,
      service_interest TEXT,
      phone TEXT,
      message TEXT NOT NULL,
      source TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    const sql = `INSERT INTO service_contacts (
      submission_id, name, email, company, service_interest, phone, message, source, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`;

    db.run(sql, [
      payload.submissionId || ('srv_' + Date.now()),
      payload.name || 'Anonymous',
      payload.email || 'no-email@example.com',
      payload.company || null,
      payload.serviceInterest || null,
      payload.phone || null,
      payload.message || '',
      payload.source || 'geza-ai-services-website'
    ], function (err) {
      if (err) {
        console.error(JSON.stringify({ status: 'error', error: err.message }));
        process.exit(1);
      }

      try {
        const jsonlPath = path.join(baseDir, 'contacts.jsonl');
        fs.appendFileSync(jsonlPath, JSON.stringify({
          id: this.lastID,
          submissionId: payload.submissionId,
          name: payload.name,
          email: payload.email,
          company: payload.company,
          serviceInterest: payload.serviceInterest,
          phone: payload.phone,
          message: payload.message,
          source: payload.source,
          timestamp: new Date().toISOString()
        }) + '\n');
      } catch (fsErr) {
        console.warn('Could not append to JSONL:', fsErr.message);
      }

      console.log(JSON.stringify({
        status: 'success',
        id: this.lastID,
        submissionId: payload.submissionId
      }));
      db.close();
    });
  });
} catch (e) {
  console.error(JSON.stringify({ status: 'error', error: e.message }));
  process.exit(1);
}
