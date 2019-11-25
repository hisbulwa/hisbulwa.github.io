function heyy(){
  const title = 'Notifikasi Liga Jerman';
  const options = {
      'body': 'Ini adalah konten notifikasi dengan gambar ikon.',
      'icon': '/icon.png',
      'badge': '/icon.png',
      'actions': [
          {
              'action': 'yes-action',
              'title': 'Baik',
          },
          {
              'action': 'no-action',
              'title': 'Tutup',
          }
      ]
  }
  console.log('cihuy');
  if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(function(registration) {
        console.log('baik baik');
          registration.showNotification(title, options);
      });
  } else {
      console.error('FItur notifikasi tidak diijinkan.');
  }
}
