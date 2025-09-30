const expSection = document.querySelector('.experience-section');
const profilesSection = document.querySelector('.my-profiles');

// js/experience-section.js
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('animate');
  });
}, { threshold: 0.3 });

// Observe all sections that should animate-in
document
  .querySelectorAll('.experience-section, .my-profiles, .my-clients')
  .forEach(el => el && observer.observe(el));

observer.observe(expSection);
observer.observe(profilesSection);