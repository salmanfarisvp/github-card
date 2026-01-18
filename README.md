# GitHub Card

A simple web application to fetch and display GitHub user profile data with a beautiful card view.

## Features

- Visual profile card with avatar and stats
- Fetch GitHub user data via username
- Click-to-copy IDs, URLs, and other fields
- View raw JSON data
- Modern, responsive design

## Usage

1. Open `index.html` in your browser
2. Enter a GitHub username
3. Click "Fetch Data" or press Enter
4. View profile information in card or JSON format
5. Click any ID or URL field to copy to clipboard

## Project Structure

```
gh-profile/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
└── README.md
```

## API

Uses the [GitHub REST API](https://docs.github.com/en/rest/users/users#get-a-user) to fetch user data.
