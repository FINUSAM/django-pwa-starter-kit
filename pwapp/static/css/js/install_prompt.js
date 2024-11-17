let deferredPrompt; // Store the install prompt event

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); // Prevent the browser's default prompt
  deferredPrompt = e;

  // Show your custom install button or banner
  const installButton = document.getElementById('addToHomeScreenButton'); 
  installButton.style.display = 'block'; // Or however you want to show it

  installButton.addEventListener('click', (e) => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPrompt = null;
    });
  });
});