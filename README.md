# YouTube Dashboard

Can be visit live [here](https://youtube-dashboard-a5zwh230l-tauqueer-khans-projects.vercel.app/) 

## Getting Started

First, run the development server:

```bash
npm run dev
```


## Features

- **Video Selection**: Select a YouTube video to view and trim.
- **Video Playback**: Play and pause the selected video.
- **Trim Functionality**: Set start and end points to trim the video.
- **Mute/Unmute**: Toggle sound on the video player.
- **Progress Bar**: View and control the current playback time.
- **Local Storage**: Save and load trim settings for each video.

## Future improvements
- **Manage state with URL**: Instead of using context to store state, this can be done with url as well. There are a few advantages of this doing, primarily with regards to sharability. We can store the video id, start and end time in the url and that should enable the ability to share. There are a few consideration, such as how do we manage the existing local trims with that of the URL. Do we override or create a temp state. These would definitely add a lot more complexity and was placed out of scope for this exercise.
