const expSection = document.querySelector('.experience-section');
const profilesSection = document.querySelector('.my-profiles');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate');
    }
  });
}, {
  threshold: 0.3
});

observer.observe(expSection);
observer.observe(profilesSection);