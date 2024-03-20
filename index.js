const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const ytdl = require('ytdl-core');
const TikTokScraper = require('tiktok-scraper');
 
const ffm = require('./ffm')
const app = express();
app.use(express.json());
// Middleware
app.use(morgan('dev'));

// Routes 
app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.post('/getVideoYoutube', async (req, res) => {
  const youtubeUrl = req.body.youtubeUrl

  try {
    const video = await ffm.dowVideoYoutube(youtubeUrl);
    if(!video) return res.status(400).send("downloading YouTube video")
    return res.status(200).send('YouTube video downloaded successfully!');
  } catch (error) {
    console.error('Error downloading YouTube video:', error);
    res.status(500).send('Error downloading YouTube video');
  }
});


app.post('/getVideoTikTok', async (req, res) => {
  const { tiktokUrl, tiktokOutputPath } = req.body;

  try {
    await downloadTikTokVideo(tiktokUrl, tiktokOutputPath);
    res.status(200).send('TikTok video downloaded successfully!');
  } catch (error) {
    console.error('Error downloading TikTok video:', error);
    res.status(500).send('Error downloading TikTok video');
  }
});
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


 
// Function to download video from TikTok
   async function downloadTikTokVideo(videoUrl, outputPath) {
  try {
    const videoMeta = await TikTokScraper.getVideoMeta(videoUrl);
    const videoUrl = videoMeta.collector[0].videoUrl;
    
    const response = await fetch(videoUrl);
    const videoBuffer = await response.buffer();

    fs.writeFileSync(outputPath, videoBuffer);
    
    console.log('TikTok video downloaded successfully!');
  } catch (error) {
    console.error('Error downloading TikTok video:', error);
  }
}