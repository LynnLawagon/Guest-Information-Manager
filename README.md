# Guest Information Manager

A responsive guest ID scanning and PDF record tool. The original Legaspi Inn-specific interface has been generalized so it can be used by different people and organizations.

## What changed

- Replaced the Supabase guest database with browser **LocalStorage**.
- Removed Supabase configuration and credentials from the project.
- Added a records page with search, delete, JSON backup export, and backup import.
- Added responsive layouts for desktop, tablet, and mobile screens.
- Updated the landing page, scanner, form, records list, and generated PDF branding.
- Kept the Python OCR service, Teachable Machine ID classification, camera capture, image/PDF upload, and PDF generation.
- Added fixed local gender options so no database lookup is needed.

## Important: how LocalStorage works

Guest records are stored in the browser profile on the device where they were created. They do **not** automatically synchronize to another phone, tablet, or computer. Use **Export backup** on the Saved Records page, then **Import backup** on the other device to move records. Do not clear browser site data unless you have a backup. LocalStorage is intended for a small, single-user/local-device workflow, not as a secure multi-user database.

The OCR and PDF functions still run through the Flask backend. For use from multiple personal devices, host the Flask app on a server and open it over HTTPS. Each browser will still have its own separate LocalStorage records. Camera access generally requires HTTPS (except localhost).

## Requirements

- Python 3.10+
- pip
- A modern browser

## Install and run locally

From the project folder:

```bash
cd backend
python -m venv .venv
```

Activate the environment:

**Windows**

```powershell
.venv\Scripts\activate
```

**macOS/Linux**

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the app:

```bash
python app.py
```

Open `http://127.0.0.1:5000` in your browser. The first OCR run may take longer while EasyOCR downloads/loads its language model.

## Technologies

- Flask – OCR/PDF backend
- EasyOCR and OpenCV – text extraction and image processing
- Teachable Machine – ID type classification
- ReportLab – PDF generation
- HTML, CSS, and JavaScript – responsive interface and LocalStorage records

## Privacy and security notes

- ID images are sent to the Flask backend for OCR processing. The backend writes uploaded images to `backend/static/uploads/`; configure retention and deletion before production use.
- Saved guest form records are stored in browser LocalStorage and are not encrypted by this app. Anyone with access to the same browser profile may be able to view them.
- Do not use this as a shared, multi-user, or high-security records system without adding authentication, access controls, encryption, and a properly managed database.
- Use HTTPS when hosted, especially when accessing the camera or processing personal information.
- Export backups securely because the JSON backup contains personal information.
