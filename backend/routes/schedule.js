const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Schedule = require('../models/Schedule');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Demo Mode Storage Fallback
let demoSchedule = [
  {
    _id: 'sched_1',
    srNo: 1,
    appointmentId: 'APT-1001',
    patientName: 'John Doe',
    contact: '+91 98765 43210',
    doctor: 'Dr. Sarah Connor (Emergency Medicine)',
    room: 'OPD Trauma Room 101',
    time: '09:00 AM',
    triage: 'EMERGENCY',
    status: 'COMPLETED',
    notes: 'Severe Chest Discomfort'
  },
  {
    _id: 'sched_2',
    srNo: 2,
    appointmentId: 'APT-1002',
    patientName: 'Anita Roy',
    contact: '+91 99887 76655',
    doctor: 'Dr. Rajesh Kumar (Cardiology)',
    room: 'Cabin 204 - 2nd Floor',
    time: '09:30 AM',
    triage: 'URGENT',
    status: 'IN_PROGRESS',
    notes: 'Hypertension Consultation'
  },
  {
    _id: 'sched_3',
    srNo: 3,
    appointmentId: 'APT-1003',
    patientName: 'Rahul Sharma',
    contact: '+91 91234 56789',
    doctor: 'Dr. Priya Mehta (Orthopedics)',
    room: 'OPD Clinic 108',
    time: '10:00 AM',
    triage: 'URGENT',
    status: 'WAITING',
    notes: 'Right Wrist Sprain'
  },
  {
    _id: 'sched_4',
    srNo: 4,
    appointmentId: 'APT-1004',
    patientName: 'Vikram Singh',
    contact: '+91 98111 22233',
    doctor: 'Dr. Sarah Connor (Emergency Medicine)',
    room: 'OPD Trauma Room 101',
    time: '10:30 AM',
    triage: 'ROUTINE',
    status: 'WAITING',
    notes: 'General Health Checkup'
  },
  {
    _id: 'sched_5',
    srNo: 5,
    appointmentId: 'APT-1005',
    patientName: 'Pooja Verma',
    contact: '+91 97222 33344',
    doctor: 'Dr. Rajesh Kumar (Cardiology)',
    room: 'Cabin 204 - 2nd Floor',
    time: '11:00 AM',
    triage: 'EMERGENCY',
    status: 'WAITING',
    notes: 'Acute Asthma Breathlessness'
  }
];

let currentCallingSrNo = 2;

const isHeaderOrNoiseLine = (line) => {
  if (!line || typeof line !== 'string') return true;
  const lower = line.toLowerCase().trim();
  if (lower.length <= 2) return true;

  // 1. Check for Section Headings / Category Titles (e.g. "Emergency Ward:", "OPD Schedule Summary:", "Cardiology:")
  if (/^[a-z0-9\s\-&/()]{3,45}:$/i.test(lower)) {
    return true;
  }

  // 2. Comprehensive Heading, Banner, Metadata & Disclaimer keywords
  const noiseKeywords = [
    'patient name', 'doctor name', 'room number', 'cabin number', 'appointment time',
    'triage priority', 'queue status', 'serial number', 'sr. no', 'sr no', 'sr.no', 'sr.no.',
    'opd schedule', 'daily schedule', 'hospital management', 'printed on',
    'department of', 'page 1', 'page 2', 'page 3', 'page 4', 'date:', 'report generated', 
    'schedule list', 'patient list', 'doctor/room', 'time / status', 'hospital command center', 
    'opd queue', 'assigned doctor', 'triage', 'desk action', 'in cabin', 'appointment id',
    'disclaimer', 'note:', 'notice:', 'important:', 'signature', 'medical officer',
    'all rights reserved', 'confidential', 'address:', 'contact us', 'phone:', 'telephone',
    'fax:', 'email:', 'website:', 'building', 'hospital street', 'arrival time', 'requested',
    'timing:', 'total count', 'summary:', 'stamp', 'receptionist', 'instructions:',
    'outpatient department', 'emergency ward', 'consultation hours', 'registration fee',
    'serial #', 'token #', 'patient details', 'doctor in charge', 'medical report'
  ];

  for (const keyword of noiseKeywords) {
    if (lower.includes(keyword)) return true;
  }

  // 3. Table Column Header Definition Patterns
  if (/(sr\.?\s*no\.?|id|#|token)\s*[,|\t;-]\s*(name|patient)/i.test(lower)) return true;
  if (/(patient|name)\s*[,|\t;-]\s*(doctor|physician|consultant)/i.test(lower)) return true;
  if (/(doctor|consultant)\s*[,|\t;-]\s*(room|cabin|department)/i.test(lower)) return true;

  // 4. Sentence & Disclaimer Prose Heuristics (>70 chars without table delimiters)
  if (lower.length > 70 && !line.includes('|') && !line.includes(',') && !line.includes('\t')) {
    return true;
  }

  // 5. Grammar Prose Terms (Instruction sentences)
  if (/\b(please|requested|arrive|brought|according|thank you|regards|signature|timing)\b/i.test(lower)) {
    return true;
  }

  return false;
};

// --- BULLETPROOF UNIVERSAL MULTI-FORMAT PARSER WITH KEY-VALUE & HEADER DYNAMICS ---
const parseScheduleText = (textContent) => {
  if (!textContent || typeof textContent !== 'string') return { parsedItems: [], excludedLines: [] };

  const lines = textContent
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const parsedItems = [];
  const excludedLines = [];
  let autoSr = 1;
  let baseTimeMinutes = 9 * 60; // Start at 09:00 AM

  lines.forEach((rawLine, index) => {
    if (isHeaderOrNoiseLine(rawLine)) {
      excludedLines.push(rawLine);
      return;
    }

    let line = rawLine;

    // A. Check for explicit Key-Value Pairs in the line (e.g., "Patient: Ramesh Patel, Doctor: Dr. Sharma, Room: 101")
    let kvName = '';
    let kvDoctor = '';
    let kvRoom = '';
    let kvTime = '';
    let kvTriage = '';

    const kvNameMatch = line.match(/(?:patient(?:\s*name)?|name)\s*:\s*([A-Za-z\s.']+?)(?:[,|\t;]|$|doctor|room|time|triage)/i);
    const kvDoctorMatch = line.match(/(?:doctor|dr|consultant)\s*:\s*([A-Za-z\s.']+?)(?:[,|\t;]|$|room|time|triage)/i);
    const kvRoomMatch = line.match(/(?:room|cabin|clinic|dept)\s*:\s*([A-Za-z0-9\s#]+?)(?:[,|\t;]|$|time|triage)/i);
    const kvTimeMatch = line.match(/(?:time|slot)\s*:\s*([0-9:a-zA-Z\s]+?)(?:[,|\t;]|$|triage)/i);
    const kvTriageMatch = line.match(/(?:triage|priority)\s*:\s*([A-Za-z]+)/i);

    if (kvNameMatch) kvName = kvNameMatch[1].trim();
    if (kvDoctorMatch) kvDoctor = kvDoctorMatch[1].trim();
    if (kvRoomMatch) kvRoom = kvRoomMatch[1].trim();
    if (kvTimeMatch && /\d/.test(kvTimeMatch[1])) kvTime = kvTimeMatch[1].trim();
    if (kvTriageMatch) {
      const t = kvTriageMatch[1].toUpperCase();
      if (t.includes('EMERG')) kvTriage = 'EMERGENCY';
      else if (t.includes('URG')) kvTriage = 'URGENT';
      else kvTriage = 'ROUTINE';
    }

    // 1. Extract Time
    let time = kvTime;
    if (!time) {
      const time12Match = line.match(/\b(?:1[0-2]|0?[1-9]):[0-5][0-9]\s*(?:AM|PM|am|pm)\b/);
      const time24Match = line.match(/\b(?:[01]?[0-9]|2[0-3]):[0-5][0-9]\b/);

      if (time12Match) {
        time = time12Match[0].toUpperCase();
        line = line.replace(time12Match[0], ' ');
      } else if (time24Match) {
        const [hStr, mStr] = time24Match[0].split(':');
        let h = parseInt(hStr, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        if (h > 12) h -= 12;
        if (h === 0) h = 12;
        time = `${h}:${mStr} ${ampm}`;
        line = line.replace(time24Match[0], ' ');
      } else {
        const h = Math.floor(baseTimeMinutes / 60);
        const m = baseTimeMinutes % 60;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h > 12 ? h - 12 : (h === 0 ? 12 : h);
        const displayM = m < 10 ? `0${m}` : m;
        time = `${displayH}:${displayM} ${ampm}`;
        baseTimeMinutes += 30;
      }
    }

    // 2. Extract Triage
    let triage = kvTriage || 'ROUTINE';
    if (!kvTriage) {
      if (/\b(EMERGENCY|EMERG|CRITICAL|SEVERE|RED)\b/i.test(line)) {
        triage = 'EMERGENCY';
        line = line.replace(/\b(EMERGENCY|EMERG|CRITICAL|SEVERE|RED)\b/gi, ' ');
      } else if (/\b(URGENT|HIGH|PRIORITY|YELLOW)\b/i.test(line)) {
        triage = 'URGENT';
        line = line.replace(/\b(URGENT|HIGH|PRIORITY|YELLOW)\b/gi, ' ');
      } else if (/\b(ROUTINE|NORMAL|LOW|GREEN)\b/i.test(line)) {
        triage = 'ROUTINE';
        line = line.replace(/\b(ROUTINE|NORMAL|LOW|GREEN)\b/gi, ' ');
      }
    }

    // 3. Extract Status
    let status = 'WAITING';
    if (/\b(IN_PROGRESS|IN CABIN|CONSULTING|ACTIVE)\b/i.test(line)) {
      status = 'IN_PROGRESS';
      line = line.replace(/\b(IN_PROGRESS|IN CABIN|CONSULTING|ACTIVE)\b/gi, ' ');
    } else if (/\b(COMPLETED|DONE|FINISHED)\b/i.test(line)) {
      status = 'COMPLETED';
      line = line.replace(/\b(COMPLETED|DONE|FINISHED)\b/gi, ' ');
    } else if (/\b(CANCELLED|CANCELED)\b/i.test(line)) {
      status = 'CANCELLED';
      line = line.replace(/\b(CANCELLED|CANCELED)\b/gi, ' ');
    } else if (/\b(WAITING|PENDING|QUEUED)\b/i.test(line)) {
      status = 'WAITING';
      line = line.replace(/\b(WAITING|PENDING|QUEUED)\b/gi, ' ');
    }

    // 4. Extract Doctor Name
    let doctor = kvDoctor || 'General OPD Specialist';
    if (!kvDoctor) {
      const doctorMatch = line.match(/\b(?:Dr\.?|Doctor)\s+[A-Za-z\s.]{2,30}(?:\([^)]+\))?/i);
      if (doctorMatch) {
        doctor = doctorMatch[0].trim();
        line = line.replace(doctorMatch[0], ' ');
      }
    }

    // 5. Extract Room / Cabin
    let room = kvRoom || 'OPD Room 101';
    if (!kvRoom) {
      const roomMatch = line.match(/\b(?:Room|Cabin|OPD|Clinic|Trauma|Hall|Ward|Floor)\s*#?\d+[A-Z]?\b/i) || 
                        line.match(/\bOPD\s+Cabin\s+\d+\b/i);
      if (roomMatch) {
        room = roomMatch[0].trim();
        line = line.replace(roomMatch[0], ' ');
      }
    }

    // 6. Extract Phone Number
    let contact = '+91 ***** *****';
    const phoneMatch = line.match(/\+?\d{1,4}[-.\s]?\d{10}\b|\b\d{10}\b/);
    if (phoneMatch) {
      contact = phoneMatch[0];
      line = line.replace(phoneMatch[0], ' ');
    }

    // 7. Extract Sr. No.
    let srNo = autoSr;
    const srMatch = line.match(/^#?\b(\d+)\b[.):\s-]*/);
    if (srMatch) {
      const parsedSr = parseInt(srMatch[1], 10);
      if (parsedSr > 0 && parsedSr < 500) {
        srNo = parsedSr;
        line = line.replace(srMatch[0], ' ');
      }
    }

    // 8. Clean Remaining Text to Get Patient Name & Notes
    let remaining = line
      .replace(/[,|\t;:]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    remaining = remaining.replace(/^(mr\.?|mrs\.?|ms\.?|patient:?)\s+/i, '');

    let patientName = kvName || '';
    let notes = 'Appointment Record';

    if (!patientName) {
      if (remaining.includes('-')) {
        const parts = remaining.split('-').map(p => p.trim()).filter(p => p.length > 0);
        patientName = parts[0] || '';
        if (parts[1]) notes = parts[1];
      } else {
        patientName = remaining;
      }
    }

    patientName = patientName
      .replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9\s.']+$/g, '')
      .trim();

    const invalidNameWords = [
      'doctor', 'hospital', 'patient', 'name', 'room', 'triage', 
      'status', 'time', 'date', 'opd', 'schedule', 'cabin', 
      'assigned', 'priority', 'action', 'queue', 'disclaimer',
      'signature', 'contact', 'telephone', 'printed', 'department',
      'clinic', 'section', 'details', 'report', 'outpatient'
    ];
    
    const isInvalid = !patientName || 
                      patientName.length < 2 || 
                      invalidNameWords.includes(patientName.toLowerCase()) ||
                      /^\d+$/.test(patientName);

    if (!isInvalid) {
      parsedItems.push({
        _id: 'sched_' + Date.now() + '_' + index,
        srNo,
        appointmentId: 'APT-' + (1000 + srNo),
        patientName: patientName,
        contact: contact,
        doctor: doctor,
        room: room,
        time: time,
        triage: triage,
        status: status,
        notes: notes
      });

      autoSr = Math.max(autoSr + 1, srNo + 1);
    } else {
      excludedLines.push(rawLine);
    }
  });

  return { parsedItems, excludedLines };
};

// @route   GET api/schedule/lookup
router.get('/lookup', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ msg: 'Please provide an Appointment ID, Sr. No. or Patient Name' });
    }

    const cleanQuery = query.toString().trim().toLowerCase().replace(/^#/, '');

    let activeList = demoSchedule;
    if (global.isDbConnected) {
      const dbList = await Schedule.find().lean();
      if (dbList && dbList.length > 0) activeList = dbList;
    }

    // Match Appointment ID (e.g. APT-1001), Sr. No., or Patient Name
    const match = activeList.find(s => 
      (s.appointmentId && s.appointmentId.toLowerCase() === cleanQuery) ||
      (s.appointmentId && s.appointmentId.toLowerCase() === `apt-${cleanQuery}`) ||
      s.srNo.toString() === cleanQuery || 
      s.patientName.toLowerCase().includes(cleanQuery) ||
      (s._id && s._id.toString().toLowerCase() === cleanQuery)
    );

    if (!match) {
      return res.status(404).json({ 
        msg: `No appointment record found for "${query}". Please check the Sr. No. or check with hospital reception.` 
      });
    }

    const currentCalling = activeList.find(s => s.status === 'IN_PROGRESS') || 
                           activeList.find(s => s.status === 'WAITING') || 
                           activeList[0];

    const waitingBefore = activeList.filter(s => s.status === 'WAITING' && s.srNo < match.srNo).length;
    const estWaitMinutes = match.status === 'COMPLETED' ? 0 : match.status === 'IN_PROGRESS' ? 0 : (waitingBefore + 1) * 12;

    res.json({
      success: true,
      data: match,
      queueInfo: {
        currentCallingSrNo: currentCalling ? currentCalling.srNo : currentCallingSrNo,
        currentCallingPatient: currentCalling ? currentCalling.patientName : 'N/A',
        totalInQueue: activeList.filter(s => s.status === 'WAITING').length,
        patientsAhead: waitingBefore,
        estimatedWaitTime: match.status === 'COMPLETED' ? 'Completed' : match.status === 'IN_PROGRESS' ? 'Currently In Cabin' : `~${estWaitMinutes} mins`
      }
    });

  } catch (err) {
    console.error('Schedule lookup error:', err);
    res.status(500).json({ msg: 'Server Error during lookup' });
  }
});

// @route   GET api/schedule/all
router.get('/all', async (req, res) => {
  try {
    let activeList = demoSchedule;
    if (global.isDbConnected) {
      const dbList = await Schedule.find().sort({ srNo: 1 }).lean();
      if (dbList && dbList.length > 0) activeList = dbList;
    }

    const sorted = [...activeList].sort((a, b) => a.srNo - b.srNo);
    const activeCalling = activeList.find(s => s.status === 'IN_PROGRESS') || activeList.find(s => s.status === 'WAITING');

    res.json({
      success: true,
      currentCallingSrNo: activeCalling ? activeCalling.srNo : currentCallingSrNo,
      count: activeList.length,
      data: sorted
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error fetching schedule list' });
  }
});

// Helper function to safely extract text from PDF, DOCX, CSV, TXT buffers
const extractTextFromBuffer = async (buffer, fileName = '', mimeType = '') => {
  const isPdf = fileName.endsWith('.pdf') || mimeType === 'application/pdf';
  const isDocx = fileName.endsWith('.docx') || mimeType.includes('word');

  if (isPdf) {
    try {
      const pdfModule = require('pdf-parse');
      
      if (typeof pdfModule === 'function') {
        const res = await pdfModule(buffer);
        if (res && res.text) return res.text;
      }
      if (typeof pdfModule.default === 'function') {
        const res = await pdfModule.default(buffer);
        if (res && res.text) return res.text;
      }
      if (typeof pdfModule.PDFParse === 'function') {
        const uint8Array = new Uint8Array(buffer);
        const parser = new pdfModule.PDFParse(uint8Array);
        if (typeof parser.load === 'function') await parser.load();
        if (typeof parser.getText === 'function') {
          const textResult = await parser.getText();
          if (typeof textResult === 'string') return textResult;
          if (textResult && textResult.text) return textResult.text;
          if (textResult && textResult.pages) return textResult.pages.map(p => p.text || '').join('\n');
        }
      }
    } catch (pdfErr) {
      console.warn('PDF parsing notice:', pdfErr.message);
    }

    // Binary regex pattern fallback for PDF
    const rawString = buffer.toString('binary');
    const matches = rawString.match(/\(([^()]{2,})\)/g);
    if (matches && matches.length > 0) {
      return matches.map(m => m.slice(1, -1)).join(' ');
    }
  }

  if (isDocx) {
    try {
      const mammoth = require('mammoth');
      if (typeof mammoth.extractRawText === 'function') {
        const res = await mammoth.extractRawText({ buffer });
        if (res && res.value) return res.value;
      }
    } catch (docxErr) {
      console.warn('DOCX parsing notice:', docxErr.message);
    }
  }

  return buffer.toString('utf-8');
};

// @route   POST api/schedule/upload-file
router.post('/upload-file', upload.single('file'), async (req, res) => {
  try {
    let extractedText = '';

    if (req.file) {
      extractedText = await extractTextFromBuffer(req.file.buffer, req.file.originalname.toLowerCase(), req.file.mimetype);
    } else if (req.body.textContent) {
      extractedText = req.body.textContent;
    } else {
      return res.status(400).json({ msg: 'Please select a PDF, DOCX, CSV, or TXT file to upload' });
    }

    if (!extractedText || !extractedText.trim()) {
      return res.status(400).json({ msg: 'Could not extract text content from the uploaded document.' });
    }

    const { parsedItems, excludedLines } = parseScheduleText(extractedText);
    if (parsedItems.length === 0) {
      return res.status(400).json({ 
        msg: 'File uploaded, but no valid patient appointment records could be parsed. (Unwanted text/headers filtered out). Check document formatting.',
        excludedLines
      });
    }

    // Save to Database or Demo Storage
    const ALLOWED_TRIAGES = ['EMERGENCY', 'URGENT', 'ROUTINE'];
    const ALLOWED_STATUSES = ['WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];

    if (global.isDbConnected) {
      await Schedule.deleteMany({});
      const dbEntries = parsedItems.map(e => ({
        srNo: e.srNo,
        appointmentId: e.appointmentId || `APT-${1000 + e.srNo}`,
        patientName: e.patientName,
        contact: e.contact || '+91 ***** *****',
        doctor: e.doctor || 'General OPD Specialist',
        room: e.room || 'OPD Room 101',
        time: e.time || '10:30 AM',
        triage: ALLOWED_TRIAGES.includes(e.triage) ? e.triage : 'ROUTINE',
        status: ALLOWED_STATUSES.includes(e.status) ? e.status : 'WAITING',
        notes: e.notes || 'Appointment Record'
      }));
      await Schedule.insertMany(dbEntries);
      demoSchedule = dbEntries;
    } else {
      demoSchedule = parsedItems;
    }

    res.json({
      success: true,
      msg: `Extracted & imported ${parsedItems.length} patient records from ${req.file?.originalname || 'document'} (${excludedLines.length} unwanted noise lines automatically filtered out).`,
      count: parsedItems.length,
      data: parsedItems,
      excludedLines: excludedLines
    });

  } catch (err) {
    console.error('File parsing error:', err);
    res.status(500).json({ msg: 'Error parsing PDF/DOCX file: ' + err.message });
  }
});

// @route   POST api/schedule/upload
router.post('/upload', async (req, res) => {
  try {
    const { textContent } = req.body;
    if (!textContent || !textContent.trim()) {
      return res.status(400).json({ msg: 'Please provide valid schedule text content' });
    }

    const { parsedItems, excludedLines } = parseScheduleText(textContent);
    if (parsedItems.length === 0) {
      return res.status(400).json({ 
        msg: 'Could not parse any valid patient appointment entries from the text provided.',
        excludedLines 
      });
    }

    const ALLOWED_TRIAGES = ['EMERGENCY', 'URGENT', 'ROUTINE'];
    const ALLOWED_STATUSES = ['WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];

    if (global.isDbConnected) {
      await Schedule.deleteMany({});
      const dbEntries = parsedItems.map(e => ({
        srNo: e.srNo,
        appointmentId: e.appointmentId || `APT-${1000 + e.srNo}`,
        patientName: e.patientName,
        contact: e.contact || '+91 ***** *****',
        doctor: e.doctor || 'General OPD Specialist',
        room: e.room || 'OPD Room 101',
        time: e.time || '10:30 AM',
        triage: ALLOWED_TRIAGES.includes(e.triage) ? e.triage : 'ROUTINE',
        status: ALLOWED_STATUSES.includes(e.status) ? e.status : 'WAITING',
        notes: e.notes || 'Appointment Record'
      }));
      await Schedule.insertMany(dbEntries);
      demoSchedule = dbEntries;
    } else {
      demoSchedule = parsedItems;
    }

    res.json({
      success: true,
      msg: `Successfully imported ${parsedItems.length} appointment entries into the daily queue (${excludedLines.length} noise lines filtered)!`,
      count: parsedItems.length,
      data: parsedItems,
      excludedLines: excludedLines
    });

    res.json({
      success: true,
      msg: `Successfully imported ${parsedEntries.length} appointment entries into the daily queue!`,
      count: parsedEntries.length,
      data: parsedEntries
    });

  } catch (err) {
    console.error('Schedule upload error:', err);
    res.status(500).json({ msg: 'Server Error parsing schedule' });
  }
});

// @route   POST api/schedule/add-single
router.post('/add-single', async (req, res) => {
  try {
    const { patientName, doctor, room, time, triage, notes } = req.body;
    if (!patientName) return res.status(400).json({ msg: 'Patient Name is required' });

    let activeList = demoSchedule;
    if (global.isDbConnected) {
      const dbList = await Schedule.find().lean();
      if (dbList && dbList.length > 0) activeList = dbList;
    }

    const maxSr = activeList.reduce((max, item) => item.srNo > max ? item.srNo : max, 0);
    const newEntry = {
      srNo: maxSr + 1,
      patientName,
      contact: '+91 ***** *****',
      doctor: doctor || 'General OPD Specialist',
      room: room || 'OPD Room 101',
      time: time || '10:30 AM',
      triage: triage || 'ROUTINE',
      status: 'WAITING',
      notes: notes || 'Manual Desk Check-in'
    };

    if (global.isDbConnected) {
      const saved = new Schedule(newEntry);
      await saved.save();
      demoSchedule.push(saved.toObject());
      return res.json({ success: true, data: saved });
    }

    demoSchedule.push({ _id: 'sched_' + Date.now(), ...newEntry });
    res.json({ success: true, data: newEntry });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error adding single patient' });
  }
});

// @route   PUT api/schedule/update-status
router.put('/update-status', async (req, res) => {
  try {
    const { id, status, srNo } = req.body;

    if (global.isDbConnected) {
      if (status === 'IN_PROGRESS') {
        await Schedule.updateMany({ status: 'IN_PROGRESS' }, { status: 'COMPLETED' });
      }
      const entry = await Schedule.findOneAndUpdate(
        { $or: [{ _id: id }, { srNo: Number(srNo) }] },
        { status },
        { new: true }
      );
      if (status === 'IN_PROGRESS' && entry) currentCallingSrNo = entry.srNo;
      return res.json({ success: true, data: entry, currentCallingSrNo });
    }

    let entry = demoSchedule.find(s => s._id === id || s.srNo === Number(srNo));
    if (!entry) return res.status(404).json({ msg: 'Appointment record not found' });

    if (status === 'IN_PROGRESS') {
      demoSchedule.forEach(s => {
        if (s.status === 'IN_PROGRESS') s.status = 'COMPLETED';
      });
      currentCallingSrNo = entry.srNo;
    }

    entry.status = status;
    res.json({ success: true, data: entry, currentCallingSrNo });

  } catch (err) {
    res.status(500).json({ msg: 'Server Error updating status' });
  }
});

// @route   DELETE api/schedule/delete/:id
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (global.isDbConnected) {
      await Schedule.deleteOne({ $or: [{ _id: id }, { srNo: Number(id) }] });
    }

    demoSchedule = demoSchedule.filter(s => s._id !== id && s.srNo !== Number(id));

    res.json({ success: true, msg: 'Patient removed from queue' });
  } catch (err) {
    console.error('Delete schedule error:', err);
    res.status(500).json({ msg: 'Server Error deleting patient record' });
  }
});

// @route   DELETE api/schedule/clear-all
router.delete('/clear-all', async (req, res) => {
  try {
    if (global.isDbConnected) {
      await Schedule.deleteMany({});
    }

    demoSchedule = [];
    currentCallingSrNo = 1;

    res.json({ success: true, msg: 'Cleared all patients from daily appointment queue' });
  } catch (err) {
    console.error('Clear schedule error:', err);
    res.status(500).json({ msg: 'Server Error clearing queue' });
  }
});

module.exports = router;
