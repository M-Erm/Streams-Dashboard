// ===========================================
// Pega informações do Cloudflare workers (Backend) e renderiza na Nova Aba.  
// ===========================================

const youtube = document.getElementById('youtube').querySelector('.scroll-container'); //Precisa do queryselector para pegar a div interna
const agenda = document.getElementById('agenda').querySelector('.scroll-container');

let slots = [];
let pendingFile = null;

function drag(scrollContainer) 
{
    let isDragging = false;
    let hasDragged = false;
    let scrollStart = 0;
    let startPos = 0;

    scrollContainer.addEventListener('mousedown', (click) => {
        isDragging = true;
        hasDragged = false;
        click.preventDefault();

        startPos = click.pageX;
        scrollStart = scrollContainer.scrollLeft;
        scrollContainer.style.cursor = 'grabbing';
        scrollContainer.style.scrollSnapType = 'none';
    });

    document.addEventListener('mousemove', (click) => {
        if (!isDragging) return;
        click.preventDefault();

        const dragDistance  = click.pageX - startPos;
        if (Math.abs(dragDistance) > 5) hasDragged = true;
        scrollContainer.scrollLeft = scrollStart - dragDistance;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        scrollContainer.style.cursor = 'grab';
        scrollContainer.style.scrollSnapType = '';
    });

    scrollContainer.addEventListener('click', (click) => {
        if (hasDragged) {
            click.stopPropagation();
            click.preventDefault();
        }
    }, true); 

    scrollContainer.addEventListener('wheel', (click) => {
        click.preventDefault();
        
        const itemWidth = 215;
        const direction = click.deltaY > 0 ? 1 : -1;
        
        scrollContainer.scrollBy({ left: direction * itemWidth, behavior: 'smooth' });
    }, { passive: false });

}

function renderUIs(HappeningStreams, ScheduledStreams)
{
    let youtubeHTML = '';
    let agendaHTML = '';

    ScheduledStreams.sort((a, b) => {
        return new Date(a.liveStreamingDetails.scheduledStartTime) - 
            new Date(b.liveStreamingDetails.scheduledStartTime);
    });

    HappeningStreams.forEach(stream => {
        try {
            youtubeHTML += `
                <div class="live"> 
                    <a href="https://www.youtube.com/watch?v=${stream.id}" target="_blank" class="live-thumb">
                        <img src="${stream.snippet.thumbnails.maxres.url}" alt="Channel Pfp"> 
                    </a>
                    <div class="live-info">

                        <div>
                            <a target="_blank" class="streamtitle" href="https://www.youtube.com/watch?v=${stream.id}">${stream.snippet.title}</a>
                        </div>

                        <a target="_blank" class="channelname" href="https://www.youtube.com/channel/${stream.snippet.channelId}"> ${stream.snippet.channelTitle} </a>
                        <div style="color: white">${stream.liveStreamingDetails.concurrentViewers} assistindo agora </div>
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
            const localStreamDate = localStreamHour.toLocaleDateString('pt-BR');

            const localStreamTimeLeftMS = localStreamHour - localCurrentTime; //Resposta em ms (número muito alto, como 1000000000)

            const localStreamTimeLeft = localStreamTimeLeftMS / (60 * 60 * 1000); // Passa a ser em Horas 
            const localStreamHoursLeft = Math.floor(localStreamTimeLeft)

            if (localStreamHoursLeft >= 24) {
                displayText = localStreamDate; // Se > 24 horas, vira data
            } else if (localStreamHoursLeft > 1) {
                displayText = "em " + localStreamHoursLeft.toLocaleString() + " horas";
            } else if (localStreamHoursLeft === 1){
                displayText = "em " + localStreamHoursLeft.toLocaleString() + " hora";
            }else {
                const localStreamMinutesLeft = Math.floor(localStreamTimeLeft * 60);
                if (localStreamMinutesLeft === 1) {
                    displayText = "em 1 minuto";
                } else {
                    displayText = "em " + localStreamMinutesLeft + " minutos";
                }
            }

            const localStreamStartTime = new Date(stream.liveStreamingDetails.scheduledStartTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            agendaHTML += `
                <div class="live"> 
                    <a href="https://www.youtube.com/watch?v=${stream.id}" target="_blank" class="live-thumb">
                        <img src="${stream.snippet.thumbnails.maxres.url}" alt="Channel Pfp"> 
                    </a>
                    <div class="live-info">

                        <div>
                            <a target="_blank" class="streamtitle" href="https://www.youtube.com/watch?v=${stream.id}">${stream.snippet.title}</a>
                        </div>

                        <a target="_blank" class="channelname" href="https://www.youtube.com/channel/${stream.snippet.channelId}"> ${stream.snippet.channelTitle} </a>
                        <div style="color: white"> Começa ${displayText} (${localStreamStartTime})</div>
                    </div>
                </div>`

        } catch (err) {
            console.log(err);
        }
    });

    youtube.innerHTML = youtubeHTML;
    agenda.innerHTML = agendaHTML;
}


async function loadStreams() 
{
    try {
    const response = await fetch("https://holo-streams.migueloliv-dev.workers.dev/streams");
    const data = await response.json(); // { ScheduledStreams, HappeningStreams }
    renderUIs(data.HappeningStreams, data.ScheduledStreams);
    drag(youtube);
    drag(agenda);
    } catch (err) {
    console.error("Erro ao carregar streams:", err);
    }
}

loadStreams();

document.addEventListener('DOMContentLoaded', async () => {
    const result = await chrome.storage.local.get('wallpapers');
    slots = result.wallpapers || [];
 
    if (slots.length === 0) {
        slots = [{ type: 'url', data: '/logo/DefaultBackground.png' }];
        await chrome.storage.local.set({ wallpapers: slots });
    }
 
    renderSlots();
    bindSlotClicks();

    if (slots[0]) {
        document.documentElement.style.setProperty(
            '--wallpaper-url',
            `url(${slots[0].data})`
        );
    }
});
 
function renderSlots() {
    const slotEls = document.querySelectorAll('.slot');
 
    slotEls.forEach((el, index) => {
        const slot = slots[index];
 
        if (slot) {
            el.style.backgroundImage = `url(${slot.data})`;
            el.classList.remove('empty');
        } else {
            el.style.backgroundImage = '';
            el.classList.add('empty');
        }
    });
}

function bindSlotClicks() {
    const slotEls = document.querySelectorAll('.slot');
 
    slotEls.forEach((el) => {
        el.addEventListener('click', async () => {
            const index = parseInt(el.dataset.index);
            if (!slots[index]) return; // slot vazio, não faz nada
 
            const chosen = slots.splice(index, 1)[0]; // remove de onde estava
            slots.unshift(chosen);                    // coloca na frente
 
            await chrome.storage.local.set({ wallpapers: slots });
 
            document.querySelectorAll('.slot').forEach(s => s.classList.remove('active')); // Atualiza qual slot tem a borda ativa
            document.querySelector('.slot[data-index="0"]').classList.add('active');
 
            renderSlots();
            document.documentElement.style.setProperty('--wallpaper-url', `url(${slots[0].data})`);
        });
    });
}
 
document.getElementById('url-btn').addEventListener('click', async () => {
    const url = document.getElementById('url-input').value.trim();
    if (!url) return;
 
    await saveWallpaper({ type: 'url', data: url });
    document.getElementById('url-input').value = '';
});
 
document.getElementById('file-input').addEventListener('change', (e) => {
    pendingFile = e.target.files[0];
 
    if (pendingFile) {
        document.getElementById('file-name').textContent = pendingFile.name;
        document.getElementById('file-set-btn').disabled = false;
    }
});

document.getElementById('wallpaper-popup').addEventListener('click', (e) => { // fecha se clicar fora do card
    if (e.target === e.currentTarget) {
        e.currentTarget.classList.add('hidden');
    }
});
 
document.getElementById('file-set-btn').addEventListener('click', () => {
    if (!pendingFile) return;
 
    compressImage(pendingFile, async (base64) => {
        await saveWallpaper({ type: 'base64', data: base64 });
 
        pendingFile = null; // Reseta o file input
        document.getElementById('file-input').value = '';
        document.getElementById('file-name').textContent = 'No file selected';
        document.getElementById('file-set-btn').disabled = true;
    });
});
 
function compressImage(file, callback) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
 
    img.onload = () => {
        const maxWidth = 1920;
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width  = img.width  * scale;
        canvas.height = img.height * scale;
 
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
 
        const base64 = canvas.toDataURL('image/jpeg', 0.85);
        callback(base64);
        URL.revokeObjectURL(img.src); // libera memória
    };
 
    img.src = URL.createObjectURL(file);
}

async function saveWallpaper(wallpaper) {
    slots = [wallpaper, ...slots].slice(0, 3);
    await chrome.storage.local.set({ wallpapers: slots });
    renderSlots();

    document.documentElement.style.setProperty('--wallpaper-url', `url(${wallpaper.data})`);
}

document.getElementById('wallpaper-btn').addEventListener('click', () => {
    document.getElementById('wallpaper-popup').classList.remove('hidden');
});

document.getElementById('popup-close').addEventListener('click', () => {
    document.getElementById('wallpaper-popup').classList.add('hidden');
});