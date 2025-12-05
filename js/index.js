// Animación del semáforo en la preview
document.addEventListener("DOMContentLoaded", () => {
    const lights = document.querySelectorAll(".preview-light")
    let activeIndex = 0
  
    setInterval(() => {
      lights.forEach((l) => {
        l.style.opacity = "0.4"
        l.style.boxShadow = "none"
      })
  
      lights[activeIndex].style.opacity = "1"
      const color = lights[activeIndex].classList.contains("green")
        ? "rgba(34, 197, 94, 0.6)"
        : lights[activeIndex].classList.contains("yellow")
          ? "rgba(234, 179, 8, 0.6)"
          : "rgba(239, 68, 68, 0.6)"
      lights[activeIndex].style.boxShadow = `0 0 15px ${color}`
  
      activeIndex = (activeIndex + 1) % lights.length
    }, 2000)
  })
  