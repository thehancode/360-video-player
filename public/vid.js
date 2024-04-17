(async function (window, videojs) {
    let player = window.player = videojs('my-video', {
        controls: true,
        autoplay: true,
        controlBar: {
            pictureInPictureToggle: false,
            fullscreenToggle: false,
            remainingTimeDisplay: {
                displayNegative: false
            }
        }
    });
    player.mediainfo = player.mediainfo || {};
    player.mediainfo.projection = '360';
    while (!player.vr){
        // ugly hack to wait for the VR plugin to load
        console.log('Waiting for VR');
        await new Promise(r => setTimeout(r, 5));
    }

    window.vr = player.vr({ projection: 'AUTO', debug: true, forceCardboard: false });
    let vr = window.vr;
}(window, window.videojs));