const socket = io("/");

var peer = new Peer();

let myVideoStream;
let mypeer = {};
const myVideo = document.createElement("video");
myVideo.muted = true;
var videoGrid = document.getElementById("video-grid");
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then((stream) => {
    myVideoStream = stream;
    addVideo(myVideo, stream);

    peer.on('call', (call) => {
        call.answer(stream);
        console.log("ANKIT");
        const video = document.createElement("video");
        // video.setAttribute("id",`${}`)
        call.on('stream', (remoteStream) => {
            addVideo(video, remoteStream);
        });

    });

    socket.on('user-connected', (userId) => {//recieves that a user is connected
        console.log("LEKHAK")
        const call = peer.call(userId, //emits stream to other users
            stream);
        const video = document.createElement("video");
        video.setAttribute("id", `${userId}`)
        call.on('stream', function (remoteStream) {
            addVideo(video, remoteStream);
        });
        call.on('close', () => {
            video.remove()
        })
        mypeer[userId] = call;
    })

});

socket.on('user-disconnected', userId => {//done on user side when emit comes from room
    console.log("connnectison closed");
    if (mypeer[userId]) {
        mypeer[userId].close()
        console.log("closed window")
    }
})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
})

const addVideo = (video, mediaStream) => {
    video.srcObject = mediaStream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}
/////////////////////////////////////MESSAGE//////////////////////////////////////////
let msg = $('input')
$('html').keydown((e) => {
    if (e.which == 13 && msg.val().length !== 0) {
        $('ul').append(`<li class="message"><b>you</b><br/>${msg.val()}</li>`)
        socket.emit('message', msg.val());
        msg.val('');
    }
})

socket.on('createMessage', message => {
    $('ul').append(`<li class="message"><b>user</b><br/>${message}</li>`)
    scrollToBottom();
})

const scrollToBottom = () => {
    let d = $('.main__chat__window');
    d.scrollTop(d.prop("scrollHeight"));
}

//////////////////////MUTE VIDEO//////////////////////////////
const muteUnmute = () => {
    const sound = myVideoStream.getAudioTracks()[0].enabled;
    if (sound) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setMuteButton();
    } else {
        myVideoStream.getAudioTracks()[0].enabled = true;
        setUnMuteButton();
    }
}

const setMuteButton = () => {
    const btn = `<i class="fa-solid fa-microphone-slash unmuted"></i>
    <span>Unmute</span>
    `
    document.querySelector(".main_mute_button").innerHTML = btn;
}
const setUnMuteButton = () => {
    const btn = `<i class="fa-solid fa-microphone"></i>
    <span>Mute</span>`
    document.querySelector(".main_mute_button").innerHTML = btn;
}
///////////////////////////

const stopPlayVideo = () => {
    const video = myVideoStream.getVideoTracks()[0].enabled;
    if (video) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setVideoButton();
    } else {
        myVideoStream.getVideoTracks()[0].enabled = true;
        unsetVideoButton();
    }
}

const setVideoButton = () => {
    const btn = `<i class="fa-solid fa-video-slash stopped"></i>
    <span>Start Video</span>
    `
    document.querySelector(".main_stop_button").innerHTML = btn;
}
const unsetVideoButton = () => {
    const btn = `<i class="fa-solid fa-video"></i>
    <span>Stop Video</span>
    `
    document.querySelector(".main_stop_button").innerHTML = btn;
}
//////////////////////////////////////////////////
const handleNav = () => {
    $('.extra-btn').toggleClass('show')
}

const handleChat = () => {
    $('.main__right').toggleClass('show')   
}