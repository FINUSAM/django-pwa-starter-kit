// In install_prompt.js
let deferredPrompt; // Store the install prompt
let alreadyPrompted = 3000; // Show after 3 seconds for the first prompt

function show_addToHomeScreen(wait_time) {
  setTimeout(() => {
    document.getElementById('close_addToHomeScreenButton').blur();
    document.getElementById('addToHomeScreenContainer').classList.add('show');
  }, wait_time);  // Show after 3 seconds, for example
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); // Prevent the default browser prompt
  deferredPrompt = e; // Stash the event so it can be triggered later

  console.log('beforeinstallprompt called');

  // Show the addToHomeScreenContainer after a delay or user interaction
  show_addToHomeScreen(alreadyPrompted);
  alreadyPrompted = 10 * 1000; // Show after 10 seconds after first prompt
});

document.getElementById('addToHomeScreenButton').addEventListener('click', (e) => {
  deferredPrompt.prompt(); // Show the install prompt

  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the A2HS prompt');
    } else {
      console.log('User dismissed the A2HS prompt');
    }
    deferredPrompt = null; // Reset the deferred prompt variable
  });

  // Hide the button after it's clicked
  document.getElementById('addToHomeScreenContainer').classList.remove('show');
});

document.getElementById('close_addToHomeScreenButton').addEventListener('click', (e) => {
  console.log('User closed the addToHomeScreen');
  document.getElementById('addToHomeScreenContainer').classList.remove('show');
  show_addToHomeScreen(1 * 1000);
});

