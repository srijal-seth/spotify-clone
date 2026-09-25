
let currentSong = new Audio();
let songs;
let currFolder;

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    let div = document.createElement('div')
    div.innerHTML = response;
    let as = div.getElementsByTagName('a')
    songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith('.mp3')) {
            songs.push(decodeURIComponent(element.href.split(`/${folder}/`)[1].split('.mp3')[0]));
        }
    }

    let songsUL = document.querySelector(".songsList").getElementsByTagName('ul')[0]
    songsUL.innerHTML = ""
    for (const song of songs) {
        songsUL.innerHTML = songsUL.innerHTML +
                            `<li>
                                <img src="img/music.svg" alt="Logo">
                                <div class="info">
                                    <div>${song.replaceAll('%20', " ")}</div>
                                    <div>Srijal</div>
                                </div>
                                <div class="playNow">
                                    <span>Play Now</span>
                                    <img class="invert" src="img/play.svg" alt="">
                                </div>
                            </li>`
    }

    Array.from(document.querySelector(".songsList").getElementsByTagName('li')).forEach(e => {
        e.addEventListener('click', element => {
            playMusic(e.querySelector('.info').firstElementChild.innerHTML);
        })
    })

    return songs
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

let playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track + ".mp3"
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg";
    }
    document.querySelector('.songinfo').innerHTML = decodeURI(track);
    document.querySelector('.songtimer').innerHTML = "00:00/00:00"
}

async function displayAlbum() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();

    let div = document.createElement('div');
    div.innerHTML = response;

    let anchor = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    let array = Array.from(anchor);

    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/")) {

            let folder = e.href.split("/").filter(Boolean).pop();


            let a = await fetch(
                `http://127.0.0.1:5500/songs/${folder}/info.json`
            );

            let response = await a.json();


            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <button>
                            <svg width="18" height="18" viewBox="0 0 330 330">
                                <path fill="#000000" d="M37.728,328.12c2.266,1.256,4.77,1.88,7.272,1.88
                                c2.763,0,5.522-0.763,7.95-2.28l240-149.999
                                c4.386-2.741,7.05-7.548,7.05-12.72
                                c0-5.172-2.664-9.979-7.05-12.72L52.95,2.28
                                c-4.625-2.891-10.453-3.043-15.222-.4
                                C32.959,4.524,30,9.547,30,15v300
                                C30,320.453,32.959,325.476,37.728,328.12z"/>
                            </svg>
                        </button>
                    </div>

                    <img src="/songs/${folder}/cover.jpg" alt="">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>`;
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(
                `songs/${item.currentTarget.dataset.folder}`
            );
            playMusic(songs[0])
        });
    });
}

async function main() {
    await getSongs("songs/feel")
    playMusic(songs[0], true)

    displayAlbum()



    play.addEventListener('click', () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

}

currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtimer").innerHTML = `${formatTime(currentSong.currentTime)}/
    ${formatTime(currentSong.duration)}`
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
})

document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
})

document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = 0;
})

document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = -120 + '%';
})

document.querySelector("#previous").addEventListener("click", () => {
    currentSong.pause();
    const currentTrack = decodeURIComponent(
        currentSong.src.split("/").pop().replace(".mp3", "")
    );
    const index = songs.indexOf(currentTrack);
    if ((index - 1) >= 0) {
        playMusic(songs[index - 1])
    }
})

document.querySelector("#next").addEventListener("click", () => {
    currentSong.pause();
    const currentTrack = decodeURIComponent(
        currentSong.src.split("/").pop().replace(".mp3", "")
    );
    const index = songs.indexOf(currentTrack);
    if ((index + 1) < songs.length) {
        playMusic(songs[index + 1])
    }
})

document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", e => {
    currentSong.volume = parseInt(e.target.value) / 100
    if(currentSong.volume > 0){
        document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg","volume.svg")   
    }
})

document.querySelector(".volume>img").addEventListener("click", e=> {
    if(e.target.src.includes("volume.svg")){
        e.target.src = e.target.src.replace("volume.svg", "mute.svg")
        currentSong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0
    }
    else{
        e.target.src = e.target.src.replace("mute.svg","volume.svg")
        currentSong.volume = 0.1;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
})

main()

