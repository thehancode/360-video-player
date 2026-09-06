(async function (window, videojs) {
    const report = (detail) => window.dispatchEvent(new CustomEvent('player-diagnostic', { detail }));
    report('player script started; videojs=' + typeof videojs);
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
    player.on('error', () => report('Video.js error: ' + JSON.stringify(player.error())));
    player.mediainfo.projection = '360';
    while (!player.vr){
        // ugly hack to wait for the VR plugin to load
        console.log('Waiting for VR');
        await new Promise(r => setTimeout(r, 5));
    }

    report('VR plugin available; readyState=' + player.readyState());
    window.vr = player.vr({ projection: 'AUTO', debug: true, forceCardboard: false });
    report('VR plugin constructed');
    let vr = window.vr;
}(window, window.videojs));
