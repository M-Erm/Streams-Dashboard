/*
const playlistIDs = channelIDs.map(el => {
  return {
    name: el.name,
    playlistID: "UU" + el.channelId.slice(2)
  };
});

async function GetYoutubeContent(playlistIDs) 
{
  // const promises = playlistIDs.map(el => { 
  //   return fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${el.playlistID}&maxResults=5&key=YOUTUBE_API_KEY`)
  // });

  const promises = [];
  for(const { playlistID } of playlistIDs) {
    promises.push(fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistID}&maxResults=5&key=YOUTUBE_API_KEY`))
  }

  const responses = await Promise.all(promises);

  const data = await Promise.all( 
    responses.map(res => res.json() 
  )); 

  return data;
}

async function GetVideoInfo(data)
{
  const videoIds = data.flatMap(el => {
	  return el.items.map(el => el.snippet.resourceId.videoId)
  })

  const requests = [];

  for (let i = 0; i < videoIds.length; i += 50) {

    const ids = videoIds
      .slice(i, i + 50)
      .join(',');

    requests.push(
      fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${ids}&key=YOUTUBE_API_KEY`)
        .then(res => res.json())
    );
  }

  const videosResponse = await Promise.all(requests);

  return videosResponse;
}


function FilterStreams(videosResponse)
{
  const ScheduledStreams = [];
  const HappeningStreams = [];

  for (const response of videosResponse) {
    for (const video of response.items)
      if (!video.liveStreamingDetails) {
        console.log("Not a video")
      }
      else if (video.liveStreamingDetails.actualStartTime && !video.liveStreamingDetails.actualEndTime) {
        console.log("Live NOW")
        HappeningStreams.push(video);
      }
      else if (video.liveStreamingDetails.scheduledStartTime && !video.liveStreamingDetails.actualStartTime) {
        console.log ("Upcoming Live")
        ScheduledStreams.push(video);
      }
      else {
        console.log ("Past Live")
      }
  } 

  return {ScheduledStreams, HappeningStreams};
}
*/