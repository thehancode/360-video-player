(function (window, videojs) {
    let player = window.player = videojs('my-video', {
        controls: true,
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

    window.vr = player.vr({ projection: 'AUTO', debug: true, forceCardboard: false });
    let vr = window.vr;
}(window, window.videojs));