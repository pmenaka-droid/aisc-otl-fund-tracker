# Google Sheets Setup Instructions

## Issue: Google Sheets API Access Failed

The system cannot access your Google Sheet because it needs proper permissions and API setup.

## Quick Fix Options:

### Option 1: Make Sheet Public (Easiest)
1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1tRmKPFJUwZtxJKlO86W31FKuzvbYArVQwm3wRr-AWW4/edit?usp=sharing
2. Click "Share" (top right)
3. Click "Change to anyone with the link"
4. Set role to "Viewer"
5. Copy the link and test again

### Option 2: Enable Google Sheets API (Recommended)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create new one
3. Go to "APIs & Services" → "Library"
4. Search "Google Sheets API" → Enable
5. Go to "APIs & Services" → "Credentials"
6. Create API Key (or use existing one)
7. Update the API key in server.js

### Option 3: Use Local Balance Data (Temporary)
The system will fall back to hardcoded balances if Google Sheets fails.

## Current Sheet Structure Expected:
- Column A: Email (user@aischennai.org)
- Column B: Name
- Column C: Department
- Column D: Balance Amount

## Test Again:
After making changes, click "Sync Balances" button in the dashboard.

## Debug Info:
- Spreadsheet ID: 1tRmKPFJUwZtxJKlO86W31FKuzvbYArVQwm3wRr-AWW4
- API Key: Using your Gemini API key
- Range: Sheet1!A:D
