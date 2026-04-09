# FTCUltimate

A React Native + Expo app for FTC practice match logging and scouting.

> **Warning:** This app is still in active development. Major bugs are known to exist

## Screenshots

<p float="left">
  <img src="../readmeimgs/Newmatch.jpg" width="220" />
  &nbsp;&nbsp;
  <img src="../readmeimgs/History.jpg" width="220" />
</p>

<p>
  <img src="../readmeimgs/TimerOnly.jpg" width="460" />
</p>

<p>
  <img src="../readmeimgs/FullMatch.jpg" width="460" />
</p>

## Features

- **Multi-mode scoring** — Timer only, Solo, or Full Match (two alliances)
- **Season config** — drop a JSON file in `seasons/` to add a new season, no code changes needed
- **Match history** — filter by season, type, and mode; view avg/best scores
- **Local + cloud sync** — WatermelonDB (SQLite) locally, Supabase for cloud backup
