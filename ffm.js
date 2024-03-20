const { spawn } = require('child_process');
const ytdl = require('ytdl-core');
const fs = require('fs');
const ffmpeg = require('ffmpeg-static');
const path = require('path');

async function dowVideoYoutube(ref) {
  const outputDir = path.resolve(__dirname, 'output');
  const n = Math.floor(Math.random() * 100000);
  const videoOutput = path.resolve(outputDir, `videoYoutube-${n}.mp4`);
  const audioOutput = path.resolve(outputDir, `audioYoutube-${n}.mp3`);

  const video = ytdl(ref, { quality: "highestvideo" });
  const audio = ytdl(ref, { quality: "highestaudio" });

  const videoWriteStream = fs.createWriteStream(videoOutput);
  const audioWriteStream = fs.createWriteStream(audioOutput);

  video.pipe(videoWriteStream);
  audio.pipe(audioWriteStream);

  await Promise.all([
    new Promise(resolve => videoWriteStream.on('finish', resolve)),
    new Promise(resolve => audioWriteStream.on('finish', resolve))
  ]);

  await mergeAudioAndVideo(videoOutput, audioOutput);
}

async function mergeAudioAndVideo(videoFile, audioFile) {
  const outputDir = path.dirname(videoFile);
  const mergedOutput = path.resolve(outputDir, `mergedVideo.mp4`);

  return new Promise((resolve, reject) => {
    const ffmpegProcess = spawn(
      ffmpeg,
      [
        '-i', videoFile,
        '-i', audioFile,
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-strict', 'experimental',
        '-map', '0:v:0',
        '-map', '1:a:0',
        mergedOutput
      ]
    );

    ffmpegProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
        deleteAudioAndVideo(audioFile,videoFile)
      } else {
        reject(new Error(`FFmpeg process failed with code ${code}`));
      }
    });

    ffmpegProcess.on('error', (err) => {
      reject(err);
    });
  });

  
}
function deleteAudioAndVideo(audioFilePath,videoFilePath){
  // Sau khi merge xong, thêm đoạn code sau để xóa file audio và video
fs.unlink(audioFilePath, (err) => {
  if (err) {
      console.error('Error deleting audio file:', err);
  } else {
      console.log('Audio file deleted successfully!');
  }
});

fs.unlink(videoFilePath, (err) => {
  if (err) {
      console.error('Error deleting video file:', err);
  } else {
      console.log('Video file deleted successfully!');
  }
});

}
module.exports = {
  dowVideoYoutube,
};
