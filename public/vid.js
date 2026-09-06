(async function (window) {
    while (typeof window.videojs !== 'function') {
        await new Promise((r) => setTimeout(r, 10));
    }
    const videojs = window.videojs;

    while (!document.getElementById('my-video')) {
        await new Promise((r) => setTimeout(r, 10));
    }

    if (window.player && typeof window.player.dispose === 'function') {
        try {
            window.player.dispose();
        } catch (e) {
            console.warn('Error disposing previous player:', e);
        }
    }

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

    while (!player.vr) {
        console.log('Waiting for VR');
        await new Promise((r) => setTimeout(r, 10));
    }

    window.vr = player.vr({ projection: 'AUTO', debug: false, forceCardboard: false });
    let vr = window.vr;
}(window));