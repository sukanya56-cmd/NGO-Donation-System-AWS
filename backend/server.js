const express = require('express');
const cors = require('cors');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3 = new S3Client({
  region: "ap-south-1"
});
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const ses = new SESClient({ region: 'ap-south-1' });
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = Number(process.env.PORT || 5000);
const DATA = __dirname;
app.use(cors());
app.use(express.json({ limit: '8mb' }));
app.use('/uploads', express.static(path.join(DATA, 'uploads')));

const files = {
  donations: path.join(DATA, 'donations.json'),
  requirements: path.join(DATA, 'requirements.json'),
  ngos: path.join(DATA, 'ngos.json'),
  users: path.join(DATA, 'users.json'),
  otps: path.join(DATA, 'otps.json')
};
for (const [key, file] of Object.entries(files)) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(key === 'ngos' ? seedNgos() : [], null, 2));
}
function read(key) { try { return JSON.parse(fs.readFileSync(files[key], 'utf8')); } catch { return []; } }
function write(key, value) { fs.writeFileSync(files[key], JSON.stringify(value, null, 2)); }
function id() { return crypto.randomUUID(); }
function cleanUser(user) { const { passwordHash, ...safe } = user; return safe; }
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}
function checkPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const actual = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}
const sessions = new Map();
function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const session = sessions.get(token);
  if (!session) return res.status(401).json({ message: 'Please log in to continue.' });
  if (session.admin) { req.user = { id: 'sahayata-admin', name: 'Sahayata Administrator', email: process.env.ADMIN_EMAIL || 'admin@sahayata.local', role: 'admin', status: 'active', verified: true }; req.token = token; return next(); }
  const user = read('users').find(u => u.id === session.userId);
  if (!user) return res.status(401).json({ message: 'Session expired. Please log in again.' });
  req.user = user; req.token = token; next();
}
function requireRole(...roles) { return (req, res, next) => roles.includes(req.user.role) ? next() : res.status(403).json({ message: 'You do not have permission to do that.' }); }
function seedNgos() {
  return [
    { id: 'ngo-helping-hand', name: 'Helping Hand Foundation', email: 'helpinghand@example.org', city: 'Bhubaneswar', state: 'Odisha', cause: 'education', category: 'Education', description: 'Supporting children with school supplies, learning materials and community education programmes.', mission: 'Make learning resources easier to access for children and families.', programs: ['School supplies and stationery', 'Educational learning materials', 'Community learning assistance'], image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=85', status: 'approved', sample: true, createdAt: new Date().toISOString() },
    { id: 'ngo-hope-for-all', name: 'Hope for All', email: 'hopeforall@example.org', city: 'Cuttack', state: 'Odisha', cause: 'food', category: 'Food & Nutrition', description: 'Community assistance focused on food, essential supplies and family support.', mission: 'Help families access essential support with dignity.', programs: ['Food and ration assistance', 'Essential supplies for families', 'Community relief initiatives'], image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=85', status: 'approved', sample: true, createdAt: new Date().toISOString() },
    { id: 'ngo-bright-future', name: 'Bright Future Initiative', email: 'brightfuture@example.org', city: 'Rourkela', state: 'Odisha', cause: 'education', category: 'Education', description: 'Learning opportunities, digital resources and educational guidance for young people.', mission: 'Help young people build confidence and skills for the future.', programs: ['Learning and skill-building activities', 'Digital learning resources', 'Educational guidance'], image: 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=900&q=85', status: 'approved', sample: true, createdAt: new Date().toISOString() }
  ];
}
function ensureSampleRequirements() {
  const current = read('requirements');
  const samples = [
    { id: 'req-hhf-medical', ngoId: 'ngo-helping-hand', ngoName: 'Helping Hand Foundation', type: 'Money', item: 'Learning kits and school supplies', quantity: 100, fulfilledQuantity: 35, amount: 50000, fulfilledAmount: 17500, description: 'Support school materials and learning kits for children.', status: 'Active', date: new Date().toISOString() },
    { id: 'req-hope-food', ngoId: 'ngo-hope-for-all', ngoName: 'Hope for All', type: 'Supplies', item: 'Family food kits', quantity: 100, fulfilledQuantity: 42, amount: 30000, fulfilledAmount: 12600, description: 'Food kits for families who need short-term support.', status: 'Active', date: new Date().toISOString() },
    { id: 'req-bright-books', ngoId: 'ngo-bright-future', ngoName: 'Bright Future Initiative', type: 'Supplies', item: 'School books', quantity: 100, fulfilledQuantity: 60, amount: 20000, fulfilledAmount: 12000, description: 'Books and learning resources for students.', status: 'Active', date: new Date().toISOString() }
  ];
  const added = samples.filter(s => !current.some(r => r.id === s.id));
  if (added.length) write('requirements', [...current, ...added]);
}
ensureSampleRequirements();
app.get('/', (_req, res) => res.json({ message: 'Sahayata API is running', status: 'ok' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Email verification / password reset. SMTP is optional for local demonstration.
app.post('/api/auth/request-otp', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const purpose = req.body.purpose === 'reset' ? 'reset' : 'register';
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
  const users = read('users');
  if (purpose === 'register' && users.some(u => u.email === email)) return res.status(409).json({ message: 'An account with this email already exists. Please log in.' });
  if (purpose === 'reset' && !users.some(u => u.email === email)) return res.status(404).json({ message: 'No account was found for this email.' });
  const otp = String(crypto.randomInt(100000, 1000000));
  const otps = read('otps').filter(o => o.email !== email || o.purpose !== purpose);
  otps.push({ id: id(), email, purpose, otpHash: crypto.createHash('sha256').update(otp).digest('hex'), expiresAt: Date.now() + 10 * 60 * 1000, attempts: 0 });
  write('otps', otps);
  

try {
    await ses.send(new SendEmailCommand({
      Source: 'sukanyan526@gmail.com',
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: 'Your Sahayata OTP' },
        Body: { Text: { Data: `Your OTP is ${otp}. It expires shortly.` } }
      }
    }));
    return res.json({ message: 'OTP sent to your email.' });
  } catch (err) {
    console.error('SES error:', err.message);
    return res.json({ message: 'Email failed (SES sandbox). Use the displayed OTP.', developmentOtp: otp });
  }
});
app.post('/api/auth/register', (req, res) => {
  const { name, email: rawEmail, password, role, otp, profile = {} } = req.body;
  const email = String(rawEmail || '').trim().toLowerCase();
  if (!name || !email || !password || !otp || !['ngo', 'donor'].includes(role)) return res.status(400).json({ message: 'Complete all required fields and verify your email OTP.' });
  if (password.length < 8) return res.status(400).json({ message: 'Password must contain at least 8 characters.' });
  const users = read('users');
  if (users.some(u => u.email === email)) return res.status(409).json({ message: 'This email is already registered.' });
  const otps = read('otps');
  const record = [...otps].reverse().find(o => o.email === email && o.purpose === 'register');
  const submittedHash = crypto.createHash('sha256').update(String(otp)).digest('hex');
  if (!record || record.expiresAcdt < Date.now() || record.otpHash !== submittedHash) return res.status(400).json({ message: 'OTP is invalid or expired. Request a new OTP.' });
  const user = { id: id(), name: String(name).trim(), email, passwordHash: hashPassword(password), role, profile, createdAt: new Date().toISOString(), verified: true, status: role === 'ngo' ? 'pending' : 'active' };
  users.push(user); write('users', users); write('otps', otps.filter(o => o.id !== record.id));
  if (role === 'ngo') {
    const ngos = read('ngos');
    ngos.push({ id: `ngo-${user.id}`, ownerId: user.id, name: String(profile.organizationName || name).trim(), email, city: profile.city || '', state: profile.state || '', cause: profile.cause || 'education', category: profile.category || 'Education', description: profile.description || '', mission: profile.mission || '', programs: profile.programs || [], image: profile.image || '', status: 'pending', sample: false, createdAt: user.createdAt });
    write('ngos', ngos);
  }
  res.status(201).json({ message: role === 'ngo' ? 'Account created. Your NGO profile is pending admin approval.' : 'Donor account created successfully.', user: cleanUser(user) });
});
app.post('/api/auth/login', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const role = req.body.role;
  if (role === 'admin') {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@sahayata.local').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
    if (email !== adminEmail || password !== adminPassword) return res.status(401).json({ message: 'Admin email or password is incorrect.' });
    const user = { id: 'sahayata-admin', name: 'Sahayata Administrator', email: adminEmail, role: 'admin', status: 'active', verified: true };
    const token = crypto.randomBytes(32).toString('hex'); sessions.set(token, { userId: user.id, admin: true });
    return res.json({ token, user });
  }
  const user = read('users').find(u => u.email === email && u.role === role);
  if (!user || !checkPassword(password, user.passwordHash)) return res.status(401).json({ message: 'Email or password is incorrect.' });
  if (!user.verified) return res.status(403).json({ message: 'Please verify your email first.' });
  if (role === 'ngo' && user.status !== 'active') return res.status(403).json({ message: 'Your NGO account is awaiting admin approval.' });
  const token = crypto.randomBytes(32).toString('hex'); sessions.set(token, { userId: user.id });
  res.json({ token, user: cleanUser(user) });
});
app.post('/api/auth/forgot-password', (req, res) => {
  const { email: rawEmail, otp, newPassword } = req.body;
  const email = String(rawEmail || '').trim().toLowerCase();
  if (!otp || !newPassword || newPassword.length < 8) return res.status(400).json({ message: 'Enter the OTP and a new password of at least 8 characters.' });
  const users = read('users'); const user = users.find(u => u.email === email);
  const record = [...read('otps')].reverse().find(o => o.email === email && o.purpose === 'reset');
  const submittedHash = crypto.createHash('sha256').update(String(otp)).digest('hex');
  if (!user || !record || record.expiresAt < Date.now() || record.otpHash !== submittedHash) return res.status(400).json({ message: 'OTP is invalid or expired. Request a new one.' });
  user.passwordHash = hashPassword(newPassword); write('users', users); write('otps', read('otps').filter(o => o.id !== record.id));
  res.json({ message: 'Password reset successfully. Please log in.' });
});
app.get('/api/auth/me', auth, (req, res) => {
  if (req.user.role === 'admin') return res.json({ user: { id: 'sahayata-admin', name: 'Sahayata Administrator', email: process.env.ADMIN_EMAIL || 'admin@sahayata.local', role: 'admin' } });
  res.json({ user: cleanUser(req.user) });
});
app.post('/api/auth/logout', auth, (req, res) => { sessions.delete(req.token); res.json({ message: 'Logged out.' }); });

app.get('/api/organizations', (_req, res) => res.json(read('ngos').filter(n => n.status === 'approved')));
app.get('/api/organizations/:id', (req, res) => {
  const ngo = read('ngos').find(n => n.id === req.params.id || n.name.toLowerCase() === decodeURIComponent(req.params.id).toLowerCase());
  if (!ngo || ngo.status !== 'approved') return res.status(404).json({ message: 'Organization not found.' });
  const requirements = read('requirements').filter(r => r.ngoId === ngo.id || r.ngoName === ngo.name);
  res.json({ organization: ngo, requirements });
});
app.get('/api/requirements', (_req, res) => res.json(read('requirements')));
app.post('/api/requirements', (req, res) => {
  const { ngoName, ngoId, type, item, quantity, amount, description } = req.body;
  if (!ngoName || !type || !item) return res.status(400).json({ message: 'Please fill all required fields.' });
  const requirements = read('requirements');
  const newRequirement = { id: id(), ngoId: ngoId || null, ngoName, type, item, quantity: Number(quantity || 0), fulfilledQuantity: 0, amount: Number(amount || 0), fulfilledAmount: 0, description: description || '', status: 'Active', date: new Date().toISOString() };
  requirements.push(newRequirement); write('requirements', requirements); res.status(201).json({ message: 'Requirement added.', requirement: newRequirement });
});

app.put('/api/ngo/profile', auth, requireRole('ngo'), (req, res) => {
  const ngos = read('ngos');
  const ngo = ngos.find(n => n.ownerId === req.user.id);
  if (!ngo) return res.status(404).json({ message: 'NGO profile not found.' });
  const allowed = ['city', 'state', 'cause', 'category', 'description', 'mission', 'programs', 'image', 'updates'];
  for (const key of allowed) if (req.body[key] !== undefined) ngo[key] = req.body[key];
  ngo.updatedAt = new Date().toISOString();
  write('ngos', ngos);
  const users = read('users');
  const user = users.find(u => u.id === req.user.id);
  if (user) { user.profile = { ...(user.profile || {}), ...Object.fromEntries(allowed.filter(k => req.body[k] !== undefined).map(k => [k, req.body[k]])) }; write('users', users); }
  res.json({ message: 'Organization profile updated.', organization: ngo });
});

app.post('/api/ngo/requirements', auth, requireRole('ngo'), (req, res) => {
  const ngo = read('ngos').find(n => n.ownerId === req.user.id);
  if (!ngo) return res.status(404).json({ message: 'NGO profile not found.' });
  const { type, item, quantity, amount, description } = req.body;
  if (!item || !type) return res.status(400).json({ message: 'Requirement type and item are required.' });
  const all = read('requirements'); const requirement = { id: id(), ngoId: ngo.id, ngoName: ngo.name, type, item, quantity: Number(quantity || 0), fulfilledQuantity: 0, amount: Number(amount || 0), fulfilledAmount: 0, description: description || '', status: 'Active', date: new Date().toISOString() };
  all.push(requirement); write('requirements', all); res.status(201).json({ requirement, message: 'Requirement added.' });
});
app.get('/api/donations', (_req, res) => res.json(read('donations')));
app.post('/api/donations', (req, res) => {
  const { name, email, amount, ngoId, ngoName, requirementId, paymentMethod = 'UPI', donorId = null } = req.body;
  const numericAmount = Number(amount);
  if (!name || !email || !Number.isFinite(numericAmount) || numericAmount <= 0) return res.status(400).json({ message: 'Enter your name, email and a valid donation amount.' });
  const donations = read('donations');
  const donation = { id: id(), name: String(name).trim(), email: String(email).trim().toLowerCase(), amount: numericAmount, ngoId: ngoId || null, ngoName: ngoName || 'General Sahayata donation', requirementId: requirementId || null, paymentMethod: ['UPI', 'Cash', 'Card', 'Bank Transfer'].includes(paymentMethod) ? paymentMethod : 'UPI', paymentStatus: 'Recorded for demonstration', receiptNumber: `SH-${Date.now().toString().slice(-8)}`, donorId: donorId || null, date: new Date().toISOString() };
  donations.push(donation); write('donations', donations);
  if (donation.requirementId) {
    const reqs = read('requirements'); const r = reqs.find(x => x.id === donation.requirementId);
    if (r) { r.fulfilledAmount = Math.min(Number(r.amount || 0), Number(r.fulfilledAmount || 0) + numericAmount); write('requirements', reqs); }
  }
  res.status(201).json({ message: 'Demo donation recorded. No real payment was processed.', donation });
});
app.get('/api/donor/donations', auth, requireRole('donor'), (req, res) => res.json(read('donations').filter(d => d.donorId === req.user.id || d.email === req.user.email)));
app.get('/api/ngo/dashboard', auth, requireRole('ngo'), (req, res) => {
  const ngo = read('ngos').find(n => n.ownerId === req.user.id);
  if (!ngo) return res.status(404).json({ message: 'NGO profile not found.' });
  res.json({ ngo, requirements: read('requirements').filter(r => r.ngoId === ngo.id || r.ngoName === ngo.name), donations: read('donations').filter(d => d.ngoId === ngo.id || d.ngoName === ngo.name) });
});
app.get('/api/admin/overview', auth, requireRole('admin'), (_req, res) => res.json({ ngos: read('ngos'), users: read('users').map(cleanUser), requirements: read('requirements'), donations: read('donations') }));
app.post('/api/admin/ngos/:id/approve', auth, requireRole('admin'), (req, res) => {
  const ngos = read('ngos'); const ngo = ngos.find(n => n.id === req.params.id);
  if (!ngo) return res.status(404).json({ message: 'NGO not found.' });
  ngo.status = 'approved'; ngo.approvedAt = new Date().toISOString();
  const users = read('users'); const user = users.find(u => u.id === ngo.ownerId); if (user) user.status = 'active';
  write('ngos', ngos); write('users', users); res.json({ message: `${ngo.name} approved.`, ngo });
});
app.post('/api/admin/ngos/:id/reject', auth, requireRole('admin'), (req, res) => {
  const ngos = read('ngos'); const ngo = ngos.find(n => n.id === req.params.id);
  if (!ngo) return res.status(404).json({ message: 'NGO not found.' });
  ngo.status = 'rejected'; const users = read('users'); const user = users.find(u => u.id === ngo.ownerId); if (user) user.status = 'rejected';
  write('ngos', ngos); write('users', users); res.json({ message: 'NGO registration rejected.' });
});
app.post("/api/s3-test-upload", async (req, res) => {
  try {
    const bucketName = "sahayata-ngo-files-2026-unique";

    const result = await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: "sahayata-test.txt",
        Body: "Sahayata S3 integration test successful",
        ContentType: "text/plain"
      })
    );

    res.json({
      success: true,
      message: "Sahayata file uploaded to S3 successfully"
    });
  } catch (error) {
    console.error("S3 upload error:", error.message);
    res.status(500).json({
      success: false,
      message: "S3 upload failed"
    });
  }
});
const uploadDocument = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, JPG, PNG, and WEBP files are allowed."));
    }
  }
});

app.post("/api/upload-file", uploadDocument.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please select a file." });
    }

    const allowedFolders = ["registration-documents", "donation-receipts"];
    const folder = req.body.folder;

    if (!allowedFolders.includes(folder)) {
      return res.status(400).json({ message: "Invalid file category." });
    }

    const bucketName = "sahayata-ngo-files-2026-unique";
    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `${folder}/${Date.now()}-${safeName}`;

    await s3.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    }));

    res.json({
      success: true,
      message: "File uploaded to S3 successfully.",
      key
    });
  } catch (error) {
    console.error("S3 file upload failed:", error.message);
    res.status(500).json({ message: "S3 file upload failed." });
  }
});
app.listen(PORT, () => console.log(`Sahayata backend running at http://localhost:${PORT}`));
const uploadLogo = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, and WEBP images are allowed."));
    }
  }
});

app.post("/api/upload-ngo-logo", uploadLogo.single("logo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please select a logo image." });
    }

    const bucketName = "sahayata-ngo-files-2026-unique";

    const key = `ngo-logos/${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    await s3.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    }));

    const imageUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: bucketName, Key: key }),
      { expiresIn: 3600 }
    );

    res.json({ success: true, key, imageUrl });
  } catch (error) {
    console.error("NGO logo upload failed:", error.message);
    res.status(500).json({ message: "NGO logo upload failed." });
  }
});
