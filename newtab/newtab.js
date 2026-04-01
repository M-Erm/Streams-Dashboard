// ===========================================
// Recebe infomações do JS da API e renderiza as informações na Nova Aba / Lê o storage para verificar se as barras devem ser renderizadas 
// ===========================================

const agenda = document.getElementById('agenda');
const youtube = document.getElementById('youtube');

function renderUIs(ScheduledStreams, HappeningStreams){

    HappeningStreams.forEach(stream => {
    try {
        youtube.innerHTML += `
            <div class="live"> 
                <a href="https://www.youtube.com/watch?v=${stream.id}" target="_blank" class="live-thumb">
                    <img src="${stream.snippet.thumbnails.maxres.url}" alt="Channel Pfp"> 
                </a>
                <div id="live-info">

                    <div class="live-title">
                        <a target="_blank" class="streamtitle" href="https://www.youtube.com/watch?v=${stream.id}">${stream.snippet.title}</a>
                    </div>

                    <a target="_blank" class="channelname" href="https://www.youtube.com/channel/${stream.snippet.channelId}"> ${stream.snippet.channelTitle} </a>
                    <span style="color: white">${stream.liveStreamingDetails.concurrentViewers} assistindo agora</span>
                </div>
            </div>`
        
            
    } catch (err) {
        console.log(err);
    }
    });

    ScheduledStreams.forEach(stream => {
    try {

        let displayText;
        const localCurrentTime = new Date();

        const localStreamHour = new Date(stream.liveStreamingDetails.scheduledStartTime);
        const localStreamDate = new Date(stream.liveStreamingDetails.scheduledStartTime).toLocaleDateString('pt-BR');

        const localStreamTimeLeftMS = localStreamHour - localCurrentTime; //Resposta em ms (número muito alto, como 1000000000)

        const localStreamTimeLeft = localStreamTimeLeftMS / (60 * 60 * 1000); // Passa a ser em Horas 
        const localStreamHoursLeft = Math.floor(localStreamTimeLeft)

        if (localStreamHoursLeft > 24) {
            displayText = localStreamDate; // Se > 24 horas, vira data
        } else if (localStreamHoursLeft >= 1) {
            displayText = localStreamHoursLeft.toLocaleString() + " hours";
        } else {
            const localStreamMinutesLeft = Math.floor(localStreamTimeLeft * 60);
            displayText = localStreamMinutesLeft.toLocaleString() + " minutes";
        }

        const localStreamStartTime = new Date(stream.liveStreamingDetails.scheduledStartTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        agenda.innerHTML += `
            <div class="live"> 
                <a href="https://www.youtube.com/watch?v=${stream.id}" target="_blank" class="live-thumb">
                    <img src="${stream.snippet.thumbnails.maxres.url}" alt="Channel Pfp"> 
                </a>
                <div id="live-info">

                    <div class="live-title">
                        <a target="_blank" class="streamtitle" href="https://www.youtube.com/watch?v=${stream.id}">${stream.snippet.title}</a>
                    </div>

                    <a target="_blank" class="channelname" href="https://www.youtube.com/channel/${stream.snippet.channelId}"> ${stream.snippet.channelTitle} </a>
                    <span style="color: white"> Começa em ${displayText} (${localStreamStartTime})</span>
                </div>
            </div>`
    } catch (err) {
        console.log(err);
    }
    });

}

async function loadStreams() {
  try {
    const response = await fetch("https://holo-streams.migueloliv-dev.workers.dev/streams");
    const data = await response.json(); // { ScheduledStreams, HappeningStreams }
    renderUIs(data.ScheduledStreams, data.HappeningStreams);
  } catch (err) {
    console.error("Erro ao carregar streams:", err);
  }
}

loadStreams();