// -------------------------
// Simple JS for interactions
// -------------------------
(function () {
  // Mobile menu toggle
  const toggle = document.getElementById("mobileToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  toggle &&
    toggle.addEventListener("click", () => {
      const isOpen = mobileMenu.style.display === "block";
      mobileMenu.style.display = isOpen ? "none" : "block";
      toggle.setAttribute("aria-expanded", String(!isOpen));
    });

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      if (href.startsWith("#")) {
        e.preventDefault();
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        // close mobile menu after click
        if (window.innerWidth < 760) {
          mobileMenu.style.display = "none";
          toggle.setAttribute("aria-expanded", "false");
        }
      }
    });
  });

  // Animate elements on scroll - very light
  const observers = document.querySelectorAll(".fade-up");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.06 }
  );
  observers.forEach((el) => io.observe(el));

  // Year in footer
  document.getElementById("year").textContent = new Date().getFullYear();

  // Contact primary button focus
  document.getElementById("contactPrimary").addEventListener("click", () => {
    document.querySelector("#contact #name")?.focus();
    location.hash = "#contact";
  });

  // Contact form handling (client-side only)
  window.submitContact = function (e) {
    e.preventDefault();
    const status = document.getElementById("formStatus");
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();
    if (!name || !email || !message) {
      status.textContent = "Please fill all fields.";
      return false;
    }

    // Simple mailto fallback (for demo). Replace with Formspree / API in production
    const subject = encodeURIComponent("Portfolio contact from " + name);
    const body = encodeURIComponent(message + "\n\n— " + name + "\n" + email);
    window.location.href = `mailto:hello@rayan.dev?subject=${subject}&body=${body}`;
    status.textContent = "Opening email client...";
    return false;
  };

  // Portfolio project modal
  const modal = document.getElementById("projectModal");
  const modalTitle = document.getElementById("projectModalTitle");
  const modalImg = document.getElementById("projectModalImg");
  const modalDesc = document.getElementById("projectModalDesc");
  const closeModal = document.getElementById("closeModal");

  function openProject(data) {
    modalTitle.textContent = data.title;
    modalImg.src = data.image;
    modalImg.alt = data.title + " screenshot";
    modalDesc.textContent = data.desc;
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
    // trap focus (brief)
    closeModal.focus();
  }
  function closeProject() {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
  }

  document.querySelectorAll(".project").forEach((card) => {
    card.addEventListener("click", () => {
      const data = JSON.parse(card.getAttribute("data-project") || "{}");
      openProject(data);
    });
    card.addEventListener("keypress", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        const data = JSON.parse(card.getAttribute("data-project") || "{}");
        openProject(data);
      }
    });
  });
  closeModal.addEventListener("click", closeProject);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeProject();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeProject();
  });

  // Accessibility: move focus back when modal closed (optional)
})();

// Project Filtering

const buttons = document.querySelectorAll(".filter-btn");
const projects = document.querySelectorAll(".project");
const grid = document.querySelector(".portfolio-grid");

// Store current filter
let currentFilter = "all";

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    const newFilter = btn.dataset.filter;
    if (newFilter === currentFilter) return; // no redundant clicks

    // Active button state
    buttons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // Step 1: Get initial positions before change
    const startPositions = new Map();
    projects.forEach(el => {
      const rect = el.getBoundingClientRect();
      startPositions.set(el, {
        top: rect.top,
        left: rect.left
      });
    });

    // Step 2: Apply filter (instantly hide, but we’ll animate layout)
    projects.forEach(el => {
      const match = newFilter === "all" || el.dataset.category === newFilter;
      el.classList.toggle("hidden", !match);
    });

    // Force layout reflow
    grid.offsetHeight;

    // Step 3: Get new positions after layout change
    projects.forEach(el => {
      const rect = el.getBoundingClientRect();
      const start = startPositions.get(el);
      if (!start) return;

      // Step 4: Calculate movement delta
      const dx = start.left - rect.left;
      const dy = start.top - rect.top;

      // Step 5: Animate to new position
      el.style.transition = "none";
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      requestAnimationFrame(() => {
        el.style.transition = "transform 0.4s ease";
        el.style.transform = "translate(0, 0)";
      });
    });

    currentFilter = newFilter;
  });
});

// Resume Section
document.addEventListener("DOMContentLoaded", function () {
  const tabButtons = document.querySelectorAll(".tab-btn, .port-btn");
  const tabContents = document.querySelectorAll(".tab-content, .port-content");

  tabButtons.forEach(button => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.tab;
      const targetContent = document.getElementById(targetId);
      const activeContent = document.querySelector(".tab-content.active");

      // If already active, do nothing
      if (targetContent.classList.contains("active")) return;

      // Remove active class from buttons
      tabButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      // Fade out current
      activeContent.classList.remove("active");
      activeContent.classList.add("fade-out");

      // After fade-out, hide it and fade in the target
      setTimeout(() => {
        activeContent.classList.remove("fade-out");

        targetContent.classList.add("active");
      }, 200); // duration matches CSS transition
    });
  });
});

// ===== Modal Elements =====
const projectModal = document.getElementById("projectModal");
const modalContent = document.getElementById("projectModalContent");
const closeModal = document.getElementById("closeModal");

// Function to open modal
function openProjectModal(projectData) {
  const { title, desc, image } = projectData;
  document.getElementById("projectModalTitle").textContent = title;
  document.getElementById("projectModalImg").src = image;
  document.getElementById("projectModalDesc").textContent = desc;

  projectModal.style.display = "flex";
  requestAnimationFrame(() => {
    projectModal.style.opacity = "1";
    modalContent.style.transform = "translateY(0)";
    modalContent.style.opacity = "1";
  });
}

// Function to close modal
function closeProjectModal() {
  projectModal.style.opacity = "0";
  modalContent.style.transform = "translateY(40px)";
  modalContent.style.opacity = "0";
  setTimeout(() => {
    projectModal.style.display = "none";
  }, 350);
}

// Close button & overlay click
closeModal.addEventListener("click", closeProjectModal);
projectModal.addEventListener("click", (e) => {
  if (e.target === projectModal) closeProjectModal();
});

// ===== Hook Up to Projects =====
document.querySelectorAll(".project").forEach((project) => {
  project.addEventListener("click", () => {
    const data = JSON.parse(project.dataset.project);
    openProjectModal(data);
  });
});